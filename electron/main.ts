import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } from 'electron';
import { join } from 'path';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    title: 'JARVIS',
    icon: join(__dirname, '../public/icon-512.png'),
    backgroundColor: '#05080d',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load URL
  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'));
  }

  // External links open in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return win;
}

function createTray(): Tray {
  // Use a simple colored square as tray icon (or load from assets)
  const icon = nativeImage.createFromNamedImage('NSActionTemplate', [16, 16] as any);
  const trayIcon = icon.resize({ width: 16, height: 16 });
  trayIcon.setTemplateImage(true);

  const t = new Tray(trayIcon);
  t.setToolTip('JARVIS');
  t.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Åpne JARVIS',
        click: () => {
          if (!mainWindow) mainWindow = createWindow();
          mainWindow.show();
          mainWindow.focus();
        },
      },
      { type: 'separator' },
      {
        label: 'Avslutt',
        click: () => {
          app.quit();
        },
      },
    ]),
  );
  t.on('click', () => {
    if (!mainWindow) mainWindow = createWindow();
    mainWindow.show();
    mainWindow.focus();
  });
  return t;
}

// IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});
ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle('close-window', () => {
  mainWindow?.hide();
});
ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url);
});

app.whenReady().then(() => {
  mainWindow = createWindow();
  tray = createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  // Keep app running in background (tray)
  if (process.platform !== 'darwin') {
    // On Windows/Linux, keep running
  }
});

app.on('before-quit', () => {
  tray?.destroy();
});

// macOS: hide dock icon if no windows (optional)
if (process.platform === 'darwin') {
  app.dock?.hide();
}
