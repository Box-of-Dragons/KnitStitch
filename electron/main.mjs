import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = !app.isPackaged;

function getIndexPath() {
  const packagedPath = join(app.getAppPath(), 'dist-desktop', 'index.html');
  const devPath = join(__dirname, '..', 'dist-desktop', 'index.html');
  const fallbackPath = join(__dirname, '..', 'public', 'pages', 'desktop', 'index.html');

  if (existsSync(packagedPath)) return packagedPath;
  if (existsSync(devPath)) return devPath;
  return fallbackPath;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 1100,
    minHeight: 760,
    show: false,
    backgroundColor: '#f7f4ef',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(null);

  win.once('ready-to-show', () => {
    win.show();
  });

  win.loadFile(getIndexPath());

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

app.whenReady().then(() => {
  ipcMain.handle('knitstitch:get-app-meta', () => ({
    version: app.getVersion(),
    name: app.getName(),
  }));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
