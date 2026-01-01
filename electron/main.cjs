const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs').promises

// App data directory - use custom path ~/.webOS/
const homeDir = app.getPath('home')
const dataDir = path.join(homeDir, '.webOS')
const dataFilePath = path.join(dataDir, 'data.json')

let mainWindow = null

// Create window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 550,
    height: 800,
    minWidth: 550,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false // Security best practice
    }
  })

  // Load Vue app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handlers for file operations
ipcMain.handle('storage:read', async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null // File doesn't exist yet
    }
    console.error('Error reading data file:', error)
    throw error
  }
})

ipcMain.handle('storage:write', async (event, data) => {
  try {
    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8')
    console.log('Data saved successfully to:', dataFilePath)
    return true
  } catch (error) {
    console.error('Error writing data file:', error)
    throw error
  }
})

// Open URL in default browser
ipcMain.handle('shell:openExternal', async (event, url) => {
  try {
    await shell.openExternal(url)
    return true
  } catch (error) {
    console.error('Error opening external URL:', error)
    throw error
  }
})

// App lifecycle
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  // On macOS, apps stay active until the user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
