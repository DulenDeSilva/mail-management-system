const clientStatus = document.getElementById('client-status');
const serverStatus = document.getElementById('server-status');
const clientLog = document.getElementById('client-log');
const serverLog = document.getElementById('server-log');

const startClientBtn = document.getElementById('start-client');
const stopClientBtn = document.getElementById('stop-client');
const startServerBtn = document.getElementById('start-server');
const stopServerBtn = document.getElementById('stop-server');

function updateButtons(service, state) {
    if (service === 'client') {
        startClientBtn.disabled = state === 'running' || state === 'starting';
        stopClientBtn.disabled = state === 'stopped';
    }

    if (service === 'server') {
        startServerBtn.disabled = state === 'running' || state === 'starting';
        stopServerBtn.disabled = state === 'stopped';
    }
}

startClientBtn.addEventListener('click', () => {
    clientLog.textContent = '';
    window.desktopAPI.startService('client');
});

stopClientBtn.addEventListener('click', () => {
    window.desktopAPI.stopService('client');
});

startServerBtn.addEventListener('click', () => {
    serverLog.textContent = '';
    window.desktopAPI.startService('server');
});

stopServerBtn.addEventListener('click', () => {
    window.desktopAPI.stopService('server');
});

window.desktopAPI.onServiceUpdate((data) => {
    const { service, state, message } = data;

    if (service === 'client') {
        clientStatus.textContent = state;
        clientLog.textContent += message;
        clientLog.scrollTop = clientLog.scrollHeight;
        updateButtons(service, state);
    }

    if (service === 'server') {
        serverStatus.textContent = state;
        serverLog.textContent += message;
        serverLog.scrollTop = serverLog.scrollHeight;
        updateButtons(service, state);
    }
});

updateButtons('client', 'stopped');
updateButtons('server', 'stopped');