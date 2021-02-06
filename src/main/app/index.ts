import { app } from 'electron';
import trojan from './trojan';
import tray from './tray';
import ping from './ping';
import country from './country';
import { appWindow } from './window';

class App {
  start() {
    tray.initMenu();
    ping.startPingService();
    country.startQueryCountryService();
    trojan.init();
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
