const wsUrl = `ws://${location.host}`;
const ws = new WebSocket(wsUrl);



ws.onopen = () => {
    document.getElementById('status').textContent = 'Подключено';
    console.log('WebSocket подключен');
};

ws.onmessage = (event) => {
    console.log('Сообщение от сервера:', event.data);
    // some stuff
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