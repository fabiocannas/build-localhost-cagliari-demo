'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mascotAPI', {
  onEvent: (callback) => {
    ipcRenderer.on('mascot-event', (_e, evt) => callback(evt));
  },
  quit: () => ipcRenderer.send('mascot-quit'),
});
