// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray, nativeImage, screen } = require('electron')
const { start } = require('repl')
const path = require('path')
const covid = require('./covid')
const exec = require('./exec')
const util = require('./util')
const platform = require('./platform')
const fetch = require('node-fetch')


let mainWindow, tray, overlay = undefined;
global.sharedObj = {}
app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  exec.kill().then(e => console.log(e))
  if (process.platform !== 'darwin') app.quit()
})

function startApp(loadEvent) {
  const location = 'us'
  covid.getRate(location).then(covid => {
    global.sharedObj.covid = covid
    global.sharedObj.location = 'United States'
    loadEvent.sender.send('app-ready', true);
  })
    .catch(err => {
      console.log("bad", err)
      loadEvent.sender.send('app-ready', err);
    })
}

/* WINDOW, TRAY */

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 325,
    // width: 650,
    height: 730,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  // and load the index.html of the app.
  mainWindow.loadFile('src/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  overlay = new BrowserWindow({
    width: width,
    height: height,
    x: 0, y: 0,
    opacity: 0,
    alwaysOnTop: true,
    frame: false,
    resizable: false,
    backgroundColor: "#000000",
  })
  overlay.setIgnoreMouseEvents(true);
  overlay.show()
}

function createTray() {
  const rootPath = path.resolve(__dirname)
  const iconName = (process.platform == 'darwin') ? 'menu-icon.png' : 'menu-icon.ico'
  const imagePath = path.join(rootPath, 'resources', platform.get(), iconName)
  const icon = nativeImage.createFromPath(imagePath)

  tray = new Tray(icon)
  tray.setIgnoreDoubleClickEvents(true)
  positionWindow()
  tray.on('click', function (event) {
    toggleWindow()
  })
}

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showWindow()
  }
}

function showWindow() {
  positionWindow()
  mainWindow.show()
  mainWindow.focus()
}

function positionWindow() {
  const trayPos = tray.getBounds()
  const windowPos = mainWindow.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height) - 765
  }
  mainWindow.setPosition(x, y, false)
}


// Update window to show version update alert
function updateWindowPositionForAlert() {
  const windowSize = mainWindow.getBounds()
  const windowMod = 70
  mainWindow.setSize(windowSize.width, windowSize.height + windowMod);
  if (process.platform != 'darwin') {
    const trayPos = tray.getBounds()
    const x = Math.round(trayPos.x + (trayPos.width / 2) - (windowSize.width / 2))
    const y = Math.round(trayPos.y + trayPos.height) - 765 - windowMod
    mainWindow.setPosition(x, y, false)
  }
}

/* LISTENERS */

ipcMain.on('app-loaded', (event) => {
  startApp(event);
})

// Get CPU perecntage
ipcMain.on('usage-request', (event) => {
  exec.usage().then(stats => {
    global.sharedObj.stats = stats
    event.sender.send('usage-completion', stats);
  })
})

// Check for a new version
ipcMain.on('version-check', (event) => {

  fetch("https://storage.googleapis.com/pandemic-pulse/code/version.json")
    .then(response => response.json())
    .then(data => {
      const newVersion = (app.getVersion() != data.version) ? true : false
      if (newVersion) updateWindowPositionForAlert()
      console.log("new verison", newVersion)
      event.sender.send('version-checked', newVersion);
    })
    .catch(err => {
      event.sender.send('version-checked', false);
    })
})


// Attach listener in the main process with the given ID
ipcMain.on('execute-request', (event, run) => {
  if (run) {
    console.log("starting process")
    exec.stress(global.sharedObj.covid).then(e => console.log("process running"))
    const brightness = util.normalize(global.sharedObj.covid.deathsScaled, 0, 100)
    overlay.setOpacity(1 - brightness)
    console.log(`[BRIGHTNESS]: ${global.sharedObj.covid.deathsScaled}%`)
  }
  else {
    console.log("killing process")
    exec.kill().then(e => console.log("process killed"))
    overlay.setOpacity(0)
  }
  event.sender.send('execute-completion', "Hello World!");
});


// Location change listener
ipcMain.on('location-request', (event, location) => {
  console.log("location-request", location)
  covid.getRate(location).then(covid => {
    global.sharedObj.covid = covid
    global.sharedObj.location = location
    event.sender.send('location-completion', global.sharedObj);
  })
    .catch(err => {
      console.log("bad", err);
    })
});

ipcMain.on('exit-app', (event, location) => {
  app.exit(0)
});
