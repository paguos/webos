const { contextBridge, ipcRenderer } = require('electron')

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  storage: {
    read: () => ipcRenderer.invoke('storage:read'),
    write: (data) => ipcRenderer.invoke('storage:write', data)
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
  },
  platform: process.platform,
  isElectron: true
})
