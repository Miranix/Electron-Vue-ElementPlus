const { app, BrowserWindow, ipcMain, Tray, nativeImage, shell, protocol, dialog, Menu } = require("electron");
const path = require("node:path");
const fs = require('fs')
const {AppName}=require(path.join(app.getAppPath(), 'package.json'));

const docP = app.getPath('documents')


let mainWindow;
const icon = nativeImage.createFromPath(path.resolve(__dirname, "./logo.png"));
const createWindow = () => {
  // Create main window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 200,
    icon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      spellcheck: false,
      webSecurity: false,
      nodeIntegration: true,
    },
  });
  if (app.isPackaged) {
    mainWindow.loadFile(path.resolve(__dirname, "./render/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:3001/");
    mainWindow.webContents.openDevTools();
  }
  mainWindow.setMenu(null);

  // Create tray icon
  tray = new Tray(icon);
  tray.on("click", () => {
    try {
      mainWindow.show();
    } catch { }
  });

  global.mainWindow = mainWindow

  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('http://localhost:3000/')) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  mainWindow.on('close', ()=>{
    app.exit()
    app.quit()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
};
app.whenReady().then(() => {
  createWindow();
});

// Single instance lock
const additionalData = { myKey: `${AppName}-lock` }
const gotTheLock = app.requestSingleInstanceLock(additionalData)

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    try {
      mainWindow.show()
    } catch { }
  })
}

app.on('ready', function () {
  protocol.registerFileProtocol('atom', function (request, callback) {
    var url = request.url.substr(7).split('?')[0];
    callback({ path: path.normalize(docP + '/main-note/atom/' + url) });
  }, function (error) {
  });
});