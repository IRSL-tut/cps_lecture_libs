# WebSocketサーバー

## メインディレクトリ

[cps_lecture_libs](https://github.com/IRSL-tut/cps_lecture_libs) ディレクトリにて行う

### cps_lecture_libs ディレクトリの作成

```
git clone https://github.com/IRSL-tut/cps_lecture_libs
```

## Nodeの導入

Nodeのサイト: [https://nodejs.org/ja/download](https://nodejs.org/ja/download)

Windowsの場合は、スタンドアローンのバイナリー(.zip)をお勧め
( 全体にインストールするならインストーラーでも良い )

ダウンロードしたZIPファイルを `<node_directory>` に解凍

`<node_directory>`は `cps_lecture_libs` の下のどこかに配置するのが良い


### 必要なパッケージのダウンロード

```
<node_directory>\npm install vite ws
```

## 認証ファイルを作成


### windowsで行う

windowsならgitbashを使用
( gitbash は windowsのgitをインストールしたら入る )

```
cd js
./make_pem.sh
```

WSLを使うことも可能。(opensslパッケージが必要)


### Linuxで行う

IMCに入る

- `ydev.imc.tut.ac.jp` に入る
- `git clone https://github.com/IRSL-tut/cps_lecture_libs`
- `js/make_pem.sh` を実行
- `key.pem`, `cert.pem` をwindowsへ持ってくる


## Websocket server

[cps_lecture_libs](https://github.com/IRSL-tut/cps_lecture_libs) ディレクトリにて

```
cd js
<node_directory>\node.exe websocket_server.js 5001 ssl
```

ポートが使用中などのエラーになったらポート番号を変える


## Local web site

ファイルの変更をテストしたいとき

[cps_lecture_libs](https://github.com/IRSL-tut/cps_lecture_libs) ディレクトリにて

```
<node_directory>\npx vite --config js\vite.config.js
```

以下のような表示になれば成功
```
  ➜  Local:   https://localhost:5173/
  ➜  Network: https://XXX.YYY.ZZZ.WWW:5173/
```

`XXX.YYY.ZZZ.WWW`は自身のIPアドレス

Windowsでは ipconfig コマンドで確認できる
