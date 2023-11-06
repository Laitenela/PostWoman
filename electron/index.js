const { app, BrowserWindow, session } = require('electron');

function createWindow(){
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1200,
    minHeight: 900,
    webSecurity: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    }
  });

  win.loadURL('http://localhost:5173/');
  // win.loadFile('dist/index.html');

  win.webContents.openDevTools();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {

    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}

app.whenReady().then(() => {
  createWindow()
})