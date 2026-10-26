const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });


wss.on('connection', function connection(ws) {
  console.log('Клиент подключился по WebSocket');


  ws.send(JSON.stringify({ message: 'Соединение установлено' }));


  ws.on('message', function incoming(data) {
    console.log('Получено сообщение от клиента:', data.toString());
    // example of stuff
    ws.send(`Сервер получил: ${data}`);
  });

  ws.on('close', function close() {
    console.log('Клиент отключился');
  });
});


server.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`WebSocket-сервер слушает на том же порту`);
});