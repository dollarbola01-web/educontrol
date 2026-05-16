import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';
import { fork } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: any = null;

function startServer() {
  // Determine path to the server bundle
  let serverPath: string;
  
  if (isDev) {
    serverPath = path.join(app.getAppPath(), 'server.ts');
  } else {
    // In production, server.cjs is in extraResources (resources/dist/server.cjs)
    serverPath = path.join(process.resourcesPath, 'dist/server.cjs');
  }

  console.log(`Starting server from: ${serverPath}`);

  if (isDev) {
    // In dev, we use tsx via fork option or child process
    serverProcess = fork(serverPath, [], {
      execArgv: ['-r', 'tsx/register'],
      env: { ...process.env, NODE_ENV: 'development' },
      silent: true
    });
  } else {
    // In production, it's a bundled JS file
    serverProcess = fork(serverPath, [], {
      env: { ...process.env, NODE_ENV: 'production' },
      silent: true
    });
  }

  serverProcess.stdout.on('data', (data: any) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data: any) => {
    console.error(`Server Error: ${data}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "EduControl LAN",
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Wait for server to be ready (short delay)
  setTimeout(() => {
    mainWindow?.loadURL('http://localhost:3000');
  }, isDev ? 5000 : 2000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
