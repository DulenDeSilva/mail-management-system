const STARTING = 'starting';
const RUNNING = 'running';
const STOPPED = 'stopped';
const ERROR = 'error';
const MAX_LOG_LINES = 220;

const services = {
    client: {
        url: 'http://localhost:5173',
        card: document.getElementById('client-card'),
        status: document.getElementById('client-status'),
        log: document.getElementById('client-log'),
        logCount: document.getElementById('client-log-count'),
        start: document.getElementById('start-client'),
        stop: document.getElementById('stop-client'),
        open: document.getElementById('open-client'),
        state: STOPPED,
        placeholder: 'Waiting for client output...'
    },
    server: {
        url: 'http://localhost:5000/api/health',
        card: document.getElementById('server-card'),
        status: document.getElementById('server-status'),
        log: document.getElementById('server-log'),
        logCount: document.getElementById('server-log-count'),
        start: document.getElementById('start-server'),
        stop: document.getElementById('stop-server'),
        open: document.getElementById('open-server'),
        state: STOPPED,
        placeholder: 'Waiting for server output...'
    }
};

const summary = {
    running: document.getElementById('running-count'),
    starting: document.getElementById('starting-count'),
    stopped: document.getElementById('stopped-count'),
    lines: document.getElementById('log-line-count')
};

const startAllBtn = document.getElementById('start-all');
const stopAllBtn = document.getElementById('stop-all');
const clearLogsBtn = document.getElementById('clear-logs');

const logBuffers = {
    client: [],
    server: []
};

function toTitleCase(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function nowLabel() {
    return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function updateSummary() {
    const states = Object.values(services).map((service) => service.state);
    const totalLines = Object.values(logBuffers).reduce(
        (count, lines) => count + lines.length,
        0
    );

    summary.running.textContent = String(states.filter((state) => state === RUNNING).length);
    summary.starting.textContent = String(
        states.filter((state) => state === STARTING).length
    );
    summary.stopped.textContent = String(states.filter((state) => state === STOPPED).length);
    summary.lines.textContent = String(totalLines);
}

function renderLog(serviceName) {
    const service = services[serviceName];
    const buffer = logBuffers[serviceName];

    service.log.textContent = buffer.length > 0 ? buffer.join('\n') : service.placeholder;
    service.logCount.textContent = `${buffer.length} ${buffer.length === 1 ? 'line' : 'lines'}`;
    service.log.scrollTop = service.log.scrollHeight;
    updateSummary();
}

function appendLog(serviceName, message, stream = 'system') {
    const lines = message
        .replace(/\r/g, '')
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

    if (lines.length === 0) {
        return;
    }

    const buffer = logBuffers[serviceName];
    const prefix = stream === 'stderr' ? '[stderr]' : stream === 'system' ? '[system]' : '';

    lines.forEach((line) => {
        buffer.push(`${nowLabel()} ${prefix} ${line}`.trim());
    });

    if (buffer.length > MAX_LOG_LINES) {
        buffer.splice(0, buffer.length - MAX_LOG_LINES);
    }

    renderLog(serviceName);
}

function setServiceState(serviceName, state) {
    const service = services[serviceName];

    service.state = state;
    service.card.dataset.state = state;
    service.status.textContent = toTitleCase(state);
    service.status.className = `status-pill status-pill--${state}`;

    service.start.disabled = state === RUNNING || state === STARTING;
    service.stop.disabled = state === STOPPED || state === ERROR;
    service.open.disabled = state !== RUNNING;

    updateSummary();
}

async function startService(serviceName) {
    await window.desktopAPI.startService(serviceName);
}

async function stopService(serviceName) {
    await window.desktopAPI.stopService(serviceName);
}

Object.entries(services).forEach(([serviceName, service]) => {
    service.start.addEventListener('click', () => {
        void startService(serviceName);
    });

    service.stop.addEventListener('click', () => {
        void stopService(serviceName);
    });

    service.open.addEventListener('click', () => {
        void window.desktopAPI.openExternal(service.url);
    });
});

startAllBtn.addEventListener('click', async () => {
    await startService('server');
    await startService('client');
});

stopAllBtn.addEventListener('click', async () => {
    await stopService('client');
    await stopService('server');
});

clearLogsBtn.addEventListener('click', () => {
    Object.keys(logBuffers).forEach((serviceName) => {
        logBuffers[serviceName] = [];
        renderLog(serviceName);
    });
});

window.desktopAPI.onServiceUpdate((data) => {
    const { service, state, message, stream } = data;

    if (!services[service]) {
        return;
    }

    setServiceState(service, state);
    appendLog(service, message, stream);
});

Object.keys(services).forEach((serviceName) => {
    setServiceState(serviceName, STOPPED);
    renderLog(serviceName);
});
