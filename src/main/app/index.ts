import { app, ipcMain } from 'electron';
import { STOP_ALL, TYPE_TROJAN, TYPE_SS } from '@/utils/const';
import trojan from './trojan';
import shadowsocks from './shadowsocks';
import tray from './tray';
import ping from './ping';
import country from './country';
import theme from './theme';
import store from './store';
import migration from './migration';
import dialog from './dialog';
import { appWindow } from './window';

class App {
  start() {
    migration.start();
    tray.initMenu();
    ping.startPingService();
    country.startQueryCountryService();
    trojan.init();
    shadowsocks.init();
    theme.init();
    dialog.init();

    if (store.enableProxy) {
      const selectedServer = store.selectedServer;
      switch (selectedServer.type) {
        case TYPE_TROJAN: {
          trojan.start();
          break;
        }
        case TYPE_SS: {
          shadowsocks.start();
          break;
        }
      }
    }

    ipcMain.on(STOP_ALL, async () => {
      await this.stop();
    });
  }

  async stop() {
    await trojan.stop();
    await shadowsocks.stop();
  }

  async reboot() {
    appWindow.isQuiting = true;
    await this.stop();
    app.relaunch();
    app.quit();
  }
}

export default new App();

export { appWindow } from './window';
