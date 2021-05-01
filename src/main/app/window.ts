import { BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { appIcon } from '@/utils/util';

class AppWindow {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  win: BrowserWindow | null = null;
  isQuiting = false;

  createWindow() {
    // Create the browser window.
    if (this.win === null) {
      this.win = new BrowserWindow({
        width: 1200,
        height: 960,
        minWidth: 1200,
        minHeight: 960,
        skipTaskbar: true,
        webPreferences: {
          // Use pluginOptions.nodeIntegration, leave this alone
          // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
          nodeIntegration: (process.env
            .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
          enableRemoteModule: true,
          webSecurity: false
        },
        icon: appIcon
      });

      if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        this.win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
        if (!process.env.IS_TEST) {
          this.win.webContents.openDevTools();
        }
      } else {
        createProtocol('app');
        // Load the index.html when not in development
        this.win.loadURL('app://./index.html');
      }

      this.win.setMenuBarVisibility(false);

      this.win.on('close', (e: Event) => {
        if (!this.isQuiting) {
          e.preventDefault();
          this.win!.hide();
        }
      });

      this.win.on('closed', () => {
        this.win = null;
      });
    } else {
      this.win.show();
    }
  }
}

export const appWindow = new AppWindow();
