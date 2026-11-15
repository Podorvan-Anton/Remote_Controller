const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);

//const offer = await connection.createOffer();
//await connection.setLocalDescription(offer);

// websocket
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    console.log('Клиент подключился по WebSocket');
    ws.send(JSON.stringify({ message: 'WebSocket: Соединение установлено' }));

    // WebRTC init
    const configuration = null;
    let connection = null;
    ws.send(JSON.stringify({event: "offer", data: "offer"}));

    ws.on('message', async function incoming(message) {
        const data = JSON.parse(message);

        if (data.type === "webrtc-offer") {
            connection = new RTCPeerConnection();
            let dataChannel = null;

            // data channel
            connection.ondatachannel = (event) => {
                dataChannel = event.channel;
                dataChannel.onopen = () => {
                    if (dataChannel) {
                        console.log("dataChannel сервера принял статус " + dataChannel.readyState);
                    }
                }
                dataChannel.onclose = () => {
                    if (dataChannel) {
                        console.log("dataChannel сервера принял статус " + dataChannel.readyState);
                    }
                }
                dataChannel.onerror = (event) => {
                    console.error(event);
                }
                dataChannel.onmessage = (message) => {
                    console.log('Получено сообщение от клиента:', message.data);
                }
            }

            // ice
            connection.onicecandidate = (event) => {
                if (event.candidate) {
                    ws.send(JSON.stringify({
                        type: "webrtc-ice-candidate",
                        candidate: event.candidate
                    }));
                }
            }

            // answer
            await connection.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await connection.createAnswer();
            await connection.setLocalDescription(answer);

            ws.send(JSON.stringify({
                type: "webrtc-answer",
                sdp: answer
            }));
        }

        if (data.type === "webrtc-ice-candidate" && connection) {
            await connection.addIceCandidate(data.candidate);
        }
    });

    ws.on('close', function close() {
        if (connection) {
            connection.close();
        }
        console.log('Клиент отключился');
    });
});







server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`WebSocket-сервер слушает на том же порту`);
});