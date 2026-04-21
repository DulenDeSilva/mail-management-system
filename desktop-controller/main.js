const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');

let mainWindow = null;
let isQuitting = false;

const NODE_EXE = 'C:\\nvm4w\\nodejs\\node.exe';
const NPM_CLI = 'C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';

const services = {
    client: {
        process: null,
        status: 'stopped',
        cwd: 'C:\\Users\\dulen\\OneDrive\\Documents\\GitHub\\mail-management-system\\client',
        args: ['run', 'dev'],
        url: 'http://localhost:5173'
    },
    server: {
        process: null,
        status: 'stopped',
        cwd: 'C:\\Users\\dulen\\OneDrive\\Documents\\GitHub\\mail-management-system\\server',
        args: ['run', 'dev'],
        url: 'http://localhost:5000/api/health'
    }
};

function cleanLog(message) {
    return message
        .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
        .replace(/\u0000/g, '')
        .replace(/\r/g, '');
}

function sendToRenderer(channel, payload) {
    if (!mainWindow) return;
    if (mainWindow.isDestroyed()) return;
    if (!mainWindow.webContents || mainWindow.webContents.isDestroyed()) return;
    mainWindow.webContents.send(channel, payload);
}

function sendServiceUpdate(serviceName, state, message, stream = 'system') {
    if (isQuitting) return;

    sendToRenderer('service:update', {
        service: serviceName,
        state,
        message,
        stream
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1260,
        height: 860,
        minWidth: 1120,
        minHeight: 760,
        backgroundColor: '#131821',
        title: 'Mail Management Controller',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', () => {
    stopService('client');
    stopService('server');

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function startService(serviceName) {
    const service = services[serviceName];

    if (!service) {
        sendServiceUpdate(serviceName, 'error', `Unknown service: ${serviceName}\n`);
        return;
    }

    if (service.process) {
        sendServiceUpdate(serviceName, service.status, `${serviceName} is already running\n`);
        return;
    }

    if (!fs.existsSync(service.cwd)) {
        sendServiceUpdate(serviceName, 'error', `Folder not found: ${service.cwd}\n`);
        return;
    }

    if (!fs.existsSync(NODE_EXE)) {
        sendServiceUpdate(serviceName, 'error', `node.exe not found: ${NODE_EXE}\n`);
        return;
    }

    if (!fs.existsSync(NPM_CLI)) {
        sendServiceUpdate(serviceName, 'error', `npm-cli.js not found: ${NPM_CLI}\n`);
        return;
    }

    service.status = 'starting';
    sendServiceUpdate(serviceName, service.status, `${serviceName} is starting...\n`);

    const child = spawn(NODE_EXE, [NPM_CLI, ...service.args], {
        cwd: service.cwd,
        shell: false,
        windowsHide: true
    });

    service.process = child;

    child.stdout.on('data', (data) => {
        const message = cleanLog(data.toString());
        const lower = message.toLowerCase();

        if (
            lower.includes('local:') ||
            lower.includes('ready in') ||
            lower.includes('listening') ||
            lower.includes('server running') ||
            lower.includes('localhost')
        ) {
            service.status = 'running';
        }

        sendServiceUpdate(serviceName, service.status, message, 'stdout');
    });

    child.stderr.on('data', (data) => {
        const message = cleanLog(data.toString());
        const visibleState = service.status === 'running' ? 'running' : service.status;
        sendServiceUpdate(serviceName, visibleState, message, 'stderr');
    });

    child.on('close', (code) => {
        service.process = null;
        service.status = 'stopped';
        sendServiceUpdate(
            serviceName,
            'stopped',
            `\n${serviceName} stopped. Exit code: ${code}\n`
        );
    });

    child.on('error', (error) => {
        service.process = null;
        service.status = 'error';
        sendServiceUpdate(serviceName, 'error', `${error.message}\n`);
    });
}

function stopService(serviceName) {
    const service = services[serviceName];

    if (!service) {
        sendServiceUpdate(serviceName, 'error', `Unknown service: ${serviceName}\n`);
        return;
    }

    if (!service.process) {
        sendServiceUpdate(serviceName, 'stopped', `${serviceName} is not running\n`);
        return;
    }

    const pid = service.process.pid;

    kill(pid, 'SIGTERM', (err) => {
        if (err) {
            sendServiceUpdate(
                serviceName,
                'error',
                `Failed to stop ${serviceName}: ${err.message}\n`
            );
            return;
        }

        service.process = null;
        service.status = 'stopped';
        sendServiceUpdate(serviceName, 'stopped', `${serviceName} stopped successfully\n`);
    });
}

ipcMain.handle('service:start', async (_, serviceName) => {
    startService(serviceName);
});

ipcMain.handle('service:stop', async (_, serviceName) => {
    stopService(serviceName);
});

ipcMain.handle('shell:openExternal', async (_, url) => {
    if (!url) return;
    await shell.openExternal(url);
});
