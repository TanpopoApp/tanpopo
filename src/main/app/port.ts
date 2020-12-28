import net from 'net';
import { appWindow } from './window';
import { USED_PORT } from '@/utils';
export interface PortOptions {
  port: number;
  host: string;
}

class Port {
  getAvailablePort(options: PortOptions) {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.on('error', reject);
      server.listen(options, () => {
        const { port } = server.address() as net.AddressInfo;
        server.close(() => {
          resolve(port);
        });
      });
    });
  }

  async checkPort(options: PortOptions) {
    try {
      const port = await this.getAvailablePort(options);
      if (port === options.port) {
        return true;
      }
    } catch (e) {
      if (appWindow.win) {
        appWindow.win.webContents.send(USED_PORT, options.port);
      }
      return false;
    }
  }
}

export default new Port();
