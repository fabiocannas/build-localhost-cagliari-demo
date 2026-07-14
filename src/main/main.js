'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const { EventEmitter } = require('events');
const path = require('path');
const config = require('./config');
const { createWebhookServer } = require('./webhook-server');

let mainWindow = null;
const bus = new EventEmitter();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: config.windowWidth,
    height: config.windowHeight,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  if (config.clickThrough) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  }

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  bus.on('mascot-event', (evt) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('mascot-event', evt);
    }
  });
}

function startWebhook() {
  const { app: webApp } = createWebhookServer({
    secret: config.webhookSecret,
    emitter: bus,
  });
  webApp.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[webhook] in ascolto su http://localhost:${config.port}/webhook`);
  });
}

app.whenReady().then(() => {
  createWindow();
  startWebhook();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Permette al renderer di richiedere la chiusura (es. tasto destro futuro)
ipcMain.on('mascot-quit', () => app.quit());
