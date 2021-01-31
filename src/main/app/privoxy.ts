import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import child_process from 'child_process';
import log from 'electron-log';
import port from './port';
import store from './store';
import {
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT,
  DEFAULT_HTTP_PORT
} from '@/utils/const';

class Privoxy {
  privoxyPath: string;
  privoxyFold: string;
  configPath: string;

  privoxy: child_process.ChildProcessWithoutNullStreams | undefined;

  config = {
    address: DEFAULT_ADDRESS,
    socksPort: DEFAULT_SOCKS_PORT,
    HTTPPort: DEFAULT_HTTP_PORT
  };

  constructor() {
    if (app.isPackaged) {
      this.privoxyFold = path.resolve(process.resourcesPath, 'helper');
      this.privoxyPath = path.resolve(this.privoxyFold, 'privoxy');
    } else {
      this.privoxyFold = path.resolve('src/helper', process.platform);
      this.privoxyPath = path.resolve(this.privoxyFold, 'privoxy');
    }
    const appDataPath = app.getPath('userData');
    this.configPath = path.resolve(appDataPath, 'privoxy.config');
  }

  async generateConfig() {
    const address = store.address;
    const socksPort = store.socksPort;
    const HTTPPort = store.HTTPPort;
    this.config = Object.assign(this.config, {
      address,
      socksPort,
      HTTPPort
    });
    const context: Dictionary<string> = {
      http: `${address}:${HTTPPort}`,
      socks5: `${address}:${socksPort}`
    };
    const template = await fs.readFile(
      path.resolve(this.privoxyFold, 'privoxy.template.conf'),
      'utf8'
    );
    const conf = template.replace(/({{\s*(.*?)\s*}})/gm, (match, p1, p2) => {
      return context[p2];
    });
    await fs.outputFile(this.configPath, conf);
  }

  async start() {
    await this.generateConfig();
    const option = {
      port: this.config.HTTPPort,
      host: this.config.address
    };
    if (await port.checkPort(option)) {
      const { spawn } = child_process;
      this.privoxy = spawn(this.privoxyPath, ['--no-daemon', this.configPath], {
        windowsHide: true
      });
      this.privoxy.stderr.on('data', err => {
        log.info(`privoxy: ${err}`);
      });
      this.privoxy.on('close', code => {
        log.warn(`privoxy exited with code ${code}`);
      });
    } else {
      log.warn(`${this.config.HTTPPort} port already used.`);
    }
  }

  async stop() {
    if (this.privoxy) {
      this.privoxy.kill();
    }
  }
}

export default new Privoxy();
