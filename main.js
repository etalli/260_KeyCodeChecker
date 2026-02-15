const path = require("path");
const { app, BrowserWindow, globalShortcut } = require("electron");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      registerGlobalShortcuts();
    }
  });
});

function registerGlobalShortcuts() {
  const accelerators = ["CommandOrControl+Shift+3", "CommandOrControl+Shift+4"];
  const statuses = {};

  for (const accelerator of accelerators) {
    const registered = globalShortcut.register(accelerator, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("global-shortcut-triggered", accelerator);
      }
    });
    statuses[accelerator] = registered;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow.webContents.send("global-shortcut-status", statuses);
    });
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
