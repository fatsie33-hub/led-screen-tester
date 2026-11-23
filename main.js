'use strict';

const path = require('node:path');
const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win = null;

function createWindow() {
  const { workAreaSize } = screen.getPrimaryDisplay();

  win = new BrowserWindow({
    width: workAreaSize.width,
    height: workAreaSize.height,
    backgroundColor: '#000000',
    fullscreen: true,
    autoHideMenuBar: true,
    show: false,
    title: 'LED Screen Tester',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  win.once('ready-to-show', () => {
    win.setFullScreen(true);
    win.show();
    win.focus();
  });

  // Raccourcis propres à la fenêtre : pas de barre de menu dans l'AppImage.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    const ctrl = input.control || input.meta;
    if (ctrl && (input.key === 'q' || input.key === 'Q' || input.key === 'w' || input.key === 'W')) {
      event.preventDefault();
      app.quit();
    } else if (input.key === 'F11') {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.handle('window:toggle-fullscreen', () => {
  if (!win) return false;
  const next = !win.isFullScreen();
  win.setFullScreen(next);
  return next;
});

ipcMain.handle('window:is-fullscreen', () => (win ? win.isFullScreen() : false));

ipcMain.on('app:quit', () => app.quit());

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.setFullScreen(true);
  win.focus();
});

app.on('window-all-closed', () => {
  app.quit();
});
