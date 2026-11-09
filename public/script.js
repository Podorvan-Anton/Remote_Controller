// web socket
const wsUrl = `ws://${location.host}`;
const ws = new WebSocket(wsUrl);

// WebRTC
const configuration = null;
let connection = null;

async function InitWebRTC() {
    connection = new RTCPeerConnection(configuration);
    const dataChannel = connection.createDataChannel("control", {
        ordered: false,
        maxRetransmits: 0
    });

    // ice
    connection.oncandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: "webrtc-ice-candidate",
                candidate: event.candidate
            }));
        }
    }

    // offer
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    ws.send(JSON.stringify({
        type: "webrtc-offer",
        sdp: offer
    }));
}

// web socket listeners
ws.onopen = () => {
    document.getElementById('status').textContent = 'Подключено';
    console.log('WebSocket подключен');

    InitWebRTC();
};

ws.onmessage = async (event) => {
    //console.log('Сообщение от сервера:', event.data);
    const data = JSON.parse(event.data);

    if (data.type === "webrtc-answer") {
        console.log(data.sdp);
        await connection.setRemoteDescription(data.sdp);
    }
    if (data.type === "webrtc-ice-candidate") {
        await connection.addIceCandidate(data.candidate);
    }
};

ws.onclose = () => {
    document.getElementById('status').textContent = 'Отключено';
    console.log('WebSocket отключен');
};

// sending commands
document.getElementById('btnForward').addEventListener('click', () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ command: 'throttle', value: 100 }));
    }
});

document.getElementById('btnStop').addEventListener('click', () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ command: 'throttle', value: 0 }));
    }
});
