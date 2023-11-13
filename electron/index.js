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
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0E1621',
      symbolColor: 'white',
      height: 31,
    }
  });

  win.setMenu(null);
  // win.loadURL('http://localhost:5173/');
  win.loadFile('dist/index.html');

  win.webContents.openDevTools();

  // win.webContents.session.on('will-download', (event, item, webContents) => {
  //   // Set the save path, making Electron not to prompt a save dialog.
  //   item.setSavePath('tmp/save.json')
  
  //   item.on('updated', (event, state) => {
  //     if (state === 'interrupted') {
  //       console.log('Download is interrupted but can be resumed')
  //     } else if (state === 'progressing') {
  //       if (item.isPaused()) {
  //         console.log('Download is paused')
  //       } else {
  //         console.log(`Received bytes: ${item.getReceivedBytes()}`)
  //       }
  //     }
  //   })
  //   item.once('done', (event, state) => {
  //     if (state === 'completed') {
  //       console.log('Download successfully')
  //     } else {
  //       console.log(`Download failed: ${state}`)
  //     }
  //   })
  // })
  
  

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