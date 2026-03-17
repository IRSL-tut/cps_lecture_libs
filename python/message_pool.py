#!/usr/bin/env python3
"""Message pool utilities translated from message_pool.js."""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Callable, Dict, Iterable, Iterator, List, Optional, Set

#
#
#
class RingBuffer:
    def __init__(self, size: int) -> None:
        self._length = 0
        self._start = 0
        self._size = size
        self._data: List[Any] = [None] * size
        self._end = size - 1
        self._overflow_cb: Optional[Callable[[Any, "RingBuffer"], None]] = None

    @property
    def size(self) -> int:
        return self._size

    @property
    def length(self) -> int:
        return self._length

    def index(self, idx: int) -> Any:
        if idx >= self._length:
            return None
        if idx < 0:
            if self._length + idx < 0:
                return None
            idx += self._length
        nidx = (self._start + idx) % self._size
        return self._data[nidx]

    def pop(self) -> Any:
        return self.get_back()

    def shift(self) -> Any:
        return self.get_front()

    def push(self, *items: Any) -> int:
        return self.add_back(*items)

    def get_back(self) -> Any:
        if self._length == 0:
            return None

        elm = self._data[self._end]
        self._data[self._end] = None
        self._end = (self._end - 1 + self._size) % self._size
        self._length -= 1
        return elm

    def get_front(self) -> Any:
        if self._length == 0:
            return None

        elm = self._data[self._start]
        self._data[self._start] = None
        self._start = (self._start + 1) % self._size
        self._length -= 1
        return elm

    def _get_n(self, n: int, func: Callable[[], Any]) -> Optional[List[Any]]:
        if n <= 0:
            return None
        res = []
        for _ in range(n):
            res.append(func())
        return res

    def get_backn(self, n: int) -> Optional[List[Any]]:
        return self._get_n(n, self.get_back)

    def get_frontn(self, n: int) -> Optional[List[Any]]:
        return self._get_n(n, self.get_front)

    def _add_back(self, elm: Any) -> None:
        new_end = (self._end + 1) % self._size

        if self._overflow_cb and self._length + 1 > self._size:
            self._overflow_cb(self._data[new_end], self)
        self._data[new_end] = elm

        if self._length < self._size:
            if self._length + 1 > self._size:
                self._length = self._size
            else:
                self._length += 1
        self._end = new_end
        self._start = (self._size + self._end - self._length + 1) % self._size

    def add_back(self, *items: Any) -> int:
        for item in items:
            self._add_back(item)
        return self._length

    def _add_front(self, elm: Any) -> None:
        if self._overflow_cb and self._length + 1 > self._size:
            self._overflow_cb(self._data[self._end], self)
        self._data[(self._size + self._start - 1) % self._size] = elm

        if self._size - self._length - 1 < 0:
            self._end += self._size - self._length - 1
            if self._end < 0:
                self._end = self._size + (self._end % self._size)

        if self._length < self._size:
            if self._length + 1 > self._size:
                self._length = self._size
            else:
                self._length += 1
        self._start -= 1
        if self._start < 0:
            self._start = self._size + (self._start % self._size)

    def add_front(self, *items: Any) -> int:
        for item in items:
            self._add_front(item)
        return self._length

    def unshift(self, *items: Any) -> int:
        for item in reversed(items):
            self._add_front(item)
        return self._length

    def get_all(self) -> List[Any]:
        raise NotImplementedError()

    def clear(self) -> None:
        self._length = 0
        self._start = 0
        self._data = [None] * self._size
        self._end = self._size - 1


class TopicBuffer(RingBuffer):
    def __init__(self, size: int, callback: Optional[Callable[[Any], bool]] = None) -> None:
        super().__init__(size)
        self.callback = callback


class MessagePool:
    def __init__(self, size: int = 100) -> None:
        self.ws_client = None
        self.topic_map: Dict[str, TopicBuffer] = {}
        self.buffer_size = size
        self.publish_method: Optional[Callable[[str], None]] = None
        self.debug = False
        self.auto_subscribe = False
        self.default_callback: Optional[Callable[[Any], bool]] = None

    def setPublishMethod(self, func: Callable[[str], None]) -> None:
        self.publish_method = func

    @staticmethod
    def makeMessageStr(topic_name: str, data: Any) -> str:
        msg = {"hash": "TUTCPS", "topic": topic_name, "data": data}
        return json.dumps(msg)

    def publish(self, topic_name: str, data: Any) -> None:
        if self.publish_method:
            msg_str = MessagePool.makeMessageStr(topic_name, data)
            if self.debug:
                print(f"publish: {msg_str}")
            self.publish_method(msg_str)

    def getMessage(self, topic_name: str, timeout: int = -1) -> Any:
        _ = timeout
        if topic_name in self.topic_map:
            buf = self.topic_map[topic_name]
            return buf.get_front()
        return None

    def readLastMessage(self, topic_name: str) -> Any:
        if topic_name in self.topic_map:
            buf = self.topic_map[topic_name]
            return buf.index(-1)
        return None

    def subscribe(self, topic_name: str, callback: Optional[Callable[[Any], bool]] = None) -> None:
        if topic_name in self.topic_map:
            buf = self.topic_map[topic_name]
            if callback:
                buf.callback = callback
        else:
            self.topic_map[topic_name] = TopicBuffer(self.buffer_size, callback)

    def unsubscribe(self, topic_name: str) -> None:
        if topic_name in self.topic_map:
            del self.topic_map[topic_name]

    @property
    def subscribingTopicList(self) -> List[str]:
        return list(self.topic_map.keys())

    @property
    def subscribingTopicIter(self) -> Iterator[str]:
        return iter(self.topic_map.keys())

    def _receiveData(self, instr: str) -> None:
        msg = json.loads(instr)
        if self.debug:
            print(f"revc: {msg}")
        if msg.get("hash") == "TUTCPS":
            if "topic" in msg and "data" in msg:
                topic = msg["topic"]
                data = msg["data"]
                if topic in self.topic_map:
                    buf = self.topic_map[topic]
                    if self.debug:
                        print(f"cb_func: {buf.callback}")
                    if buf.callback and buf.callback(data):
                        if self.debug:
                            print("do not stack message to buffer")
                        return
                    if self.debug:
                        print("stack message to buffer")
                    buf.push([datetime.now(), data])
                else:
                    if self.debug:
                        print(f"receive not subscribing topic : {topic}")
                    if self.auto_subscribe:
                        self.subscribe(topic, self.default_callback)
                        self._receiveData(instr)
#
#
#
import ssl
import threading
from websocket import create_connection
class WebMessage:
    def __init__(self, addr: str, size: int = 100, loop: Optional[asyncio.AbstractEventLoop] = None) -> None:
        self.addr = addr
        self.size = size
        self.connection = False
        self.ws_client = None
        self.msg_pool = MessagePool(self.size)
        self._recv_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self.connect()

    def connect(self) -> None:
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            self.ws_client = create_connection(self.addr, sslopt={"cert_reqs": ssl.CERT_NONE})
            self.msg_pool.setPublishMethod(lambda instr: self.ws_client.send(instr))
            self.connection = True
            print("ws open")
            self._stop_event.clear()
            self._recv_thread = threading.Thread(target=self._recv_loop, daemon=True)
            self._recv_thread.start()
        except Exception as e:
            print(f"ws connection error: {e}")
            self.connection = False

    def _recv_loop(self) -> None:
        try:
            while self.connection and not self._stop_event.is_set():
                msg = self.ws_client.recv()
                if msg:
                    self.msg_pool._receiveData(msg)
        except Exception:
            print("ws error")
        finally:
            print("ws closed")
            self.connection = False

    def close(self) -> None:
        self.connection = False
        self._stop_event.set()
        if self.ws_client:
            self.ws_client.close()
        if self._recv_thread:
            self._recv_thread.join(timeout=2)
#>#
#>#
#>#
#>import asyncio
#>import websockets
#>class WebMessage:
#>    def __init__(self, addr: str, size: int = 100, loop: Optional[asyncio.AbstractEventLoop] = None) -> None:
#>        self.addr = addr
#>        self.size = size
#>        self.connection = False
#>        self.ws_client = None
#>        self.msg_pool = MessagePool(self.size)
#>        self._recv_task: Optional[asyncio.Task] = None
#>        self._loop = loop or asyncio.get_event_loop()
#>        self._loop.create_task(self.connect())
#>
#>    async def connect(self) -> None:
#>        self.ws_client = await websockets.connect(self.addr)
#>        self.msg_pool.setPublishMethod(lambda instr: self._loop.create_task(self.ws_client.send(instr)))
#>        self.connection = True
#>        print("ws open")
#>        self._recv_task = self._loop.create_task(self._recv_loop())
#>
#>    async def _recv_loop(self) -> None:
#>        try:
#>            async for msg in self.ws_client:
#>                self.msg_pool._receiveData(msg)
#>        except Exception:
#>            print("ws error")
#>        finally:
#>            print("ws closed")
#>            self.connection = False
#>
#>    async def close(self) -> None:
#>        if self.ws_client:
#>            await self.ws_client.close()
#>        if self._recv_task:
#>            await self._recv_task
#>

class BrowserMessage:
    def __init__(self, hostwindow: Any, size: int = 100) -> None:
        self.size = size
        self.hostwindow = hostwindow
        self.connection = False
        self.connect()

    def connect(self) -> None:
        raise NotImplementedError("BrowserMessage has no direct Python equivalent.")
