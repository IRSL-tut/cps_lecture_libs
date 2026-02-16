// node websocket_server.js port [ssl [addr]]
let ws_port = 5001;
let use_ssl = false;
let ws_addr = '0.0.0.0';

if (process.argv.length > 2) {
  ws_port = parseInt(process.argv[2], 10)
}
if (process.argv.length > 3) {
  if ( process.argv[3] == 'ssl' ) {
    use_ssl = true;
  }
}
if (process.argv.length > 4) {
  ws_addr = process.argv[4];
}
if (use_ssl) {
  console.log("start server(SSL) with port : " + ws_addr + ':' + ws_port)
} else {
  console.log("start server with port : " + ws_port)
}

const WebSocketServer = require("ws").Server;
let wss_server;
let https_server;

if (use_ssl) {
  const HttpsServer = require('https').createServer;
  const fs = require('fs');
  https_server = HttpsServer({
    cert: fs.readFileSync("./cert.pem"),
    key: fs.readFileSync("./key.pem"),
    port: ws_port
  });
  wss_server = new WebSocketServer({ server: https_server });
} else {
  wss_server = new WebSocketServer({ port: ws_port });
}

//verbose
const verbose = true;
const echo_back = false;
wss_server.on("connection", (conn_client, req) => {
  const remote = req.connection.remoteAddress + ':' + req.connection.remotePort;
  if (verbose) {
    console.log('connected from ... ' + remote);
    //console.log(conn_client);
  } else {
    console.log('connected ');
  }

  conn_client.on('message', (msg) => {
    if (verbose) {
      console.log('get msg from: '+ remote);
      console.log(msg.toString('utf8'));
    }
    /// TODO: parse message

    wss_server.clients.forEach( (client) => {
      if (echo_back || client !== conn_client) {
        client.send(msg.toString('utf8'));
      }
    });
  });
  //
  conn_client.on('close', (e) => {
    if (verbose) {
      console.log('I lost a client: ' + remote);
    } else {
      console.log('I lost a client');
    }
  });
});

if (https_server) {
  https_server.listen(ws_port, ws_addr); // TODO 0.0.0.0
}

// for ssl
// openssl genrsa -out server.key 2048
// openssl req -out server.csr -key server.key -new -subj "/C=JP/ST=Aichi/O=IRSL/CN=TUT"
// openssl x509 -req -days 3650 -signkey server.key -in server.csr -out server.crt
// openssl rsa -in server.key -text > key.pem
// openssl x509 -inform PEM -in server.crt > cert.pem
