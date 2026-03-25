//
//
//
if (window.name) {
  document.title = window.name;
}

// global variables
const myGlobal = {};

function open_callback()
{
  console.log('cb: open');
  let node_text = document.getElementById("node-status");
  if (node_text) {
    node_text.innerHTML = "opened";
  }
}

function close_callback()
{
  console.log('cb: close');
  let node_text = document.getElementById("node-status");
  if (node_text) {
    node_text.innerHTML = "closed";
  }
}

function error_callback()
{
  console.log('cb: error');
  let node_text = document.getElementById("node-status");
  if (node_text) {
    node_text.innerHTML = "error";
  }
}

// settings of myGlobal.BM
function setupMessageBuffer(buffer_size=1, force_websocket=false)
{
  const url = new URL(window.location);
  const params = url.searchParams;

  if (force_websocket || params.size > 0 || !window.opener) {
    const wshost = (() => {
      let res = params.get('host');
      if (res) {
        return res;
      } else {
        return 'localhost';
      }
    })();
    const wsport = (() => {
      let res = params.get('port');
      if (res) {
        return res;
      } else {
        return '5001';
      }
    })();
    const ssl = (() => {
      let res = params.get('ssl');
      console.log(res);
      if (res && ( res == "true" || res > 0 )) {
        console.log('true');
        return true;
      } else {
        console.log('false');
        return false;
      }
    })();
    const auth = (() => {
      let res = params.get('auth');
      console.log(res);
      if (res && ( res == "true" || res > 0 )) {
        console.log('true');
        return true;
      } else {
        console.log('false');
        return false;
      }
    })();
    const bufsize = (() => {
      let res = params.get('size');
      console.log(res);
      if (res) {
        res = Number(res);
        console.log(res);
        return res;
      } else {
        console.log('100');
        return buffer_size;
      }
    })();
    let ws_url;
    if (ssl) {
      ws_url = 'wss://' + wshost + ':' + wsport;
    } else {
      ws_url = 'ws://' + wshost + ':' + wsport;
    }
    console.log('server address: ' + ws_url);
    let _args = {};
    _args['auth'] = auth;
    _args['open_callback'] = open_callback;
    _args['close_callback'] = close_callback;
    _args['error_callback'] = error_callback;
    myGlobal.BM = new WebMessage(ws_url, buffer_size, _args);
    myGlobal.BM.msg_pool.debug = false;
    if (ssl) {
      myGlobal.connection_type = 'websocket';
    } else {
      myGlobal.connection_type = 'websocket(ssl)';
    }
    myGlobal.connection_addr = wshost + ':' + wsport;
    myGlobal.connection_url = ws_url;
  } else {
    myGlobal.opener = window.opener;
    myGlobal.BM = new BrowserMessage(myGlobal.opener, buffer_size);
    myGlobal.BM.msg_pool.debug = false;
    myGlobal.connection_type = 'browser';
  }
};
//setupMessageBuffer();
