const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (path, data) => ipcRenderer.send('save-file', path, data),
  saveAndOpenFile: (path, data) => ipcRenderer.send('save-and-open-file-vscode', path, data),
})