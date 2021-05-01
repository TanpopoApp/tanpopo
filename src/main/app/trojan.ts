import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import child_process from 'child_process';
import { IAdvancedServer, IBasicServer } from '@/store/modules/server';
import {
  START_TROJAN,
  STOP_TROJAN,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT
} from '@/utils/const';
import client from '@/main/app';
import port from './port';
import privoxy from './privoxy';
import proxy from './proxy';
import store from './store';

class Trojan {
  helperPath: string;
  configPath: string;

  trojan: child_process.ChildProcessWithoutNullStreams | undefined;
  config: Dictionary<string | number | Array<string> | object> = {
    run_type: 'client',
    local_addr: DEFAULT_ADDRESS,
    local_port: DEFAULT_SOCKS_PORT,
    remote_addr: '',
    remote_port: 443,
    password: []
  };

  constructor() {
    if (app.isPackaged) {
      this.helperPath = path.resolve(process.resourcesPath, 'helper');
    } else {
      this.helperPath = path.resolve('src/helper', process.platform);
    }
    const appDataPath = app.getPath('userData');
    this.configPath = path.resolve(appDataPath, 'trojan.json');
    log.transports.file.resolvePath = (variables: log.PathVariables) => {
      return path.resolve(variables.userData, 'logs', variables.fileName!);
    };
  }

  async init() {
    ipcMain.on(START_TROJAN, async () => {
      await this.start();
    });
    ipcMain.on(STOP_TROJAN, async () => {
      await this.stop();
    });
  }

  async generateConfig() {
    const selectedServer = store.selectedServer;
    if ((selectedServer as IAdvancedServer).json) {
      this.config = JSON.parse((selectedServer as IAdvancedServer).json);
    } else {
      const basicServer = selectedServer as IBasicServer;
      const sni = basicServer.sni || '';
      const verify =
        basicServer.verify === undefined ? true : basicServer.verify;
      const verifyHostname =
        basicServer.verifyHostname === undefined
          ? true
          : basicServer.verifyHostname;
      const fastOpen =
        basicServer.fastOpen === undefined ? false : basicServer.fastOpen;

      this.config = Object.assign(this.config, {
        local_addr: store.address,
        local_port: store.socksPort,
        remote_addr: basicServer.host,
        remote_port: basicServer.port,
        password: [basicServer.password],
        ssl: {
          verify,
          verify_hostname: verifyHostname,
          sni
        },
        tcp: {
          fast_open: fastOpen
        }
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
      const trojanPath = path.resolve(this.helperPath, 'trojan');
      const { spawn } = child_process;
      this.trojan = spawn(trojanPath, ['-c', this.configPath]);
      this.trojan.stderr.on('data', data => {
        log.info(`trojan: ${data}`);
      });

      this.trojan.on('close', code => {
        log.warn(`trojan exited with code ${code}`);
      });

      await privoxy.start();
      await proxy.start();
    } else {
      log.warn(`${this.config.local_port} port already used.`);
    }
  }

  async stop() {
    if (this.trojan) {
      this.trojan.kill();
      await proxy.stop();
      await privoxy.stop();
    }
  }
}

export default new Trojan();
