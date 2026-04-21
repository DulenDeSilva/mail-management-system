const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
    startService: (serviceName) => ipcRenderer.invoke('service:start', serviceName),
    stopService: (serviceName) => ipcRenderer.invoke('service:stop', serviceName),
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
    onServiceUpdate: (callback) => {
        ipcRenderer.on('service:update', (_, data) => callback(data));
    }
});
