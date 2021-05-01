import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import child_process from 'child_process';
import { IAdvancedServer, IBasicServer } from '@/store/modules/server';
import {
  START_SS,
  STOP_SS,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT
} from '@/utils/const';
import client from '@/main/app';
import port from './port';
import privoxy from './privoxy';
import proxy from './proxy';
import store from './store';

class Shadowsocks {
  helperPath: string;
  configPath: string;

  ss: child_process.ChildProcessWithoutNullStreams | undefined;
  config: Dictionary<string | number | Array<string> | object | boolean> = {
    local_address: DEFAULT_ADDRESS,
    local_port: DEFAULT_SOCKS_PORT,
    server: '',
    server_port: 443,
    password: '',
    method: '',
    fast_open: false
  };

  constructor() {
    if (app.isPackaged) {
      this.helperPath = path.resolve(process.resourcesPath, 'helper');
    } else {
      this.helperPath = path.resolve('src/helper', process.platform);
    }
    const appDataPath = app.getPath('userData');
    this.configPath = path.resolve(appDataPath, 'shadowsocks.json');
    log.transports.file.resolvePath = (variables: log.PathVariables) => {
      return path.resolve(variables.userData, 'logs', variables.fileName!);
    };
  }

  async init() {
    ipcMain.on(START_SS, async () => {
      await this.start();
    });
    ipcMain.on(STOP_SS, async () => {
      await this.stop();
    });
  }

  async generateConfig() {
    const selectedServer = store.selectedServer;
    if ((selectedServer as IAdvancedServer).json) {
      this.config = JSON.parse((selectedServer as IAdvancedServer).json);
    } else {
      const basicServer = selectedServer as IBasicServer;
      const method = basicServer.method || 'chacha20-ietf-poly1305';
      const fastOpen =
        basicServer.fastOpen === undefined ? false : basicServer.fastOpen;

      this.config = Object.assign(this.config, {
        local_address: store.address,
        local_port: store.socksPort,
        server: basicServer.host,
        server_port: basicServer.port,
        password: basicServer.password,
        method: method,
        fast_open: fastOpen
      });
    }

    await fs.outputJson(this.configPath, this.config);
  }

  async start() {
    await this.generateConfig();
    await client.stop();
    const option = {
      port: this.config.local_port as number,
      host: this.config.local_addr as string
    };

    if (await port.checkPort(option)) {
      const ssPath = path.resolve(this.helperPath, 'sslocal');
      const { spawn } = child_process;
      this.ss = spawn(ssPath, ['-c', this.configPath]);
      this.ss.stderr.on('data', data => {
        log.info(`ss: ${data}`);
      });

      this.ss.on('close', code => {
        log.warn(`ss exited with code ${code}`);
      });

      await privoxy.start();
      await proxy.start();
    } else {
      log.warn(`${this.config.local_port} port already used.`);
    }
  }

  async stop() {
    if (this.ss) {
      this.ss.kill();
      await proxy.stop();
      await privoxy.stop();
    }
  }
}

export default new Shadowsocks();
