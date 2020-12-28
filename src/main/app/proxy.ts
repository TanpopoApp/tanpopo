import { isMac, isWin } from '@/utils';
import macProxy from './macProxy';
import winProxy from './winProxy';
class Proxy {
  async start() {
    if (isMac) {
      await macProxy.start();
    } else if (isWin) {
      await winProxy.start();
    }
  }

  async stop() {
    if (isMac) {
      await macProxy.stop();
    } else if (isWin) {
      await winProxy.stop();
    }
  }
}

export default new Proxy();
