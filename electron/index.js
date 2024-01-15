const { app, BrowserWindow, ipcMain, session } = require('electron');
const spawn = require('child_process').spawn;
const path = require('node:path');
const fs = require('fs');

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
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0E1621',
      symbolColor: 'white',
      height: 31,
    }
  });

  const filter = {
    urls: []
  }

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const headerKeys = Object.keys(details.requestHeaders);
    for(let headerKey of headerKeys){
      if(headerKey.slice(0, 3) === "__-"){
        const normalHeader = headerKey.slice(3, headerKey.length);
        details.requestHeaders[normalHeader] = details.requestHeaders[headerKey];
        delete details.requestHeaders[headerKey];
      }
    }

    callback({ requestHeaders: details.requestHeaders })
  })  

  ipcMain.on('save-file', (event, path, data) => {
    fs.writeFileSync(path, data);
  })

  ipcMain.on('save-and-open-file-vscode', (event, path, data) => {
    fs.writeFileSync(path, data);
    spawn(`code ${path}`, {shell: process.platform == 'win32'});
  })

  win.setMenu(null);
  win.loadURL('http://localhost:5173/');
  // win.loadFile('dist/index.html');

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