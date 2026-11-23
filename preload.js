'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Pont minimal entre l'interface (app.js) et la fenêtre Electron.
contextBridge.exposeInMainWorld('desktop', {
  isElectron: true,
  toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('window:is-fullscreen'),
  quit: () => ipcRenderer.send('app:quit'),
});
