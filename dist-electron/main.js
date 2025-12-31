import require$$0 from "electron";
import require$$1 from "path";
import require$$2 from "fs";
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var main$1 = {};
var hasRequiredMain;
function requireMain() {
  if (hasRequiredMain) return main$1;
  hasRequiredMain = 1;
  const { app, BrowserWindow, ipcMain, shell } = require$$0;
  const path = require$$1;
  const fs = require$$2.promises;
  const homeDir = app.getPath("home");
  const dataDir = path.join(homeDir, ".browserOS");
  const dataFilePath = path.join(dataDir, "data.json");
  let mainWindow = null;
  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 550,
      height: 800,
      minWidth: 550,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false
        // Security best practice
      }
    });
    if (process.env.NODE_ENV === "development") {
      mainWindow.loadURL("http://localhost:5173");
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }
    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }
  ipcMain.handle("storage:read", async () => {
    try {
      const data = await fs.readFile(dataFilePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      console.error("Error reading data file:", error);
      throw error;
    }
  });
  ipcMain.handle("storage:write", async (event, data) => {
    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
      console.log("Data saved successfully to:", dataFilePath);
      return true;
    } catch (error) {
      console.error("Error writing data file:", error);
      throw error;
    }
  });
  ipcMain.handle("shell:openExternal", async (event, url) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error) {
      console.error("Error opening external URL:", error);
      throw error;
    }
  });
  app.whenReady().then(createWindow);
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  return main$1;
}
var mainExports = requireMain();
const main = /* @__PURE__ */ getDefaultExportFromCjs(mainExports);
export {
  main as default
};
