import { app, ipcMain } from 'electron';
import trojan from './trojan';
import tray from './tray';
import ping from './ping';
import country from './country';
import { appWindow } from './window';
import { REBOOT } from '@/utils';

class App {
  start() {
    tray.initMenu();
    ping.startPingService();
    country.startQueryCountryService();
    trojan.init();
    ipcMain.on(REBOOT, () => {
      this.reboot();
    });
  }
  async stop() {
    await trojan.stop();
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
