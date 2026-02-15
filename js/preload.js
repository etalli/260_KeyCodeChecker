const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onGlobalShortcutTriggered: (callback) => {
    ipcRenderer.on("global-shortcut-triggered", (_event, accelerator) => {
      callback(accelerator);
    });
  },
  onGlobalShortcutStatus: (callback) => {
    ipcRenderer.on("global-shortcut-status", (_event, statuses) => {
      callback(statuses);
    });
  },
});
