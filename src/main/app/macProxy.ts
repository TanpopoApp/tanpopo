import { app } from 'electron';
import Store from 'electron-store';
import path from 'path';
import execa from 'execa';
import http from 'http';
import fs from 'fs-extra';
import log from 'electron-log';
import { Dictionary, ISettings } from '@/types';
import {
  DEFAULT_PROXY_MODE,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT,
  DEFAULT_HTTP_PORT,
  DEFAULT_PAC_PORT
} from '@/utils';
import port from './port';

const store = new Store();

class MacProxy {
  proxyPath: string;

  PACServe: http.Server | undefined;

  constructor() {
    if (app.isPackaged) {
      this.proxyPath = path.resolve(
        process.resourcesPath,
        'helper',
        'proxy.sh'
      );
    } else {
      this.proxyPath = path.resolve('src/helper', process.platform, 'proxy.sh');
    }
  }

  private getConfig() {
    const settings: ISettings = (store.get('settings') as ISettings) || {};
    const proxyMode = settings.proxyMode || DEFAULT_PROXY_MODE;
    const address = settings.address || DEFAULT_ADDRESS;
    const socksPort = settings.socksPort || DEFAULT_SOCKS_PORT.toString();
    const HTTPPort = settings.HTTPPort || DEFAULT_HTTP_PORT.toString();
    const PACPort = settings.PACPort || DEFAULT_PAC_PORT.toString();
    const PACURL = settings.PACURL || '';
    return {
      proxyMode,
      address,
      socksPort,
      HTTPPort,
      PACPort,
      PACURL
    };
  }

  async start() {
    const { proxyMode } = this.getConfig();

    switch (proxyMode) {
      case 'global': {
        await this.proxyAll();
        break;
      }

      case 'pac': {
        await this.proxyPac();
        break;
      }

      case 'local': {
        await this.stop();
        break;
      }
    }
  }

  private async proxyAll() {
    const { address, socksPort, HTTPPort } = this.getConfig();

    const { stdout } = await execa(this.proxyPath, [
      'all',
      address,
      socksPort,
      HTTPPort
    ]);
    log.info(`proxy all: ${stdout}`);
  }

  private async generatePAC() {
    const { address, socksPort, HTTPPort, PACPort } = this.getConfig();
    const option = {
      port: Number(PACPort),
      host: address
    };

    const template = await fs.readFile(
      path.resolve(this.proxyPath, '../gfwlist.template.js'),
      'utf8'
    );
    const context: Dictionary<string> = {
      proxy: `SOCKS5 ${address}:${socksPort}; PROXY ${address}:${HTTPPort};`
    };
    const conf = template.replace(/({{\s*(.*?)\s*}})/gm, (match, p1, p2) => {
      return context[p2];
    });
    if (await port.checkPort(option)) {
      this.PACServe = http
        .createServer((req, res) => {
          if (req.url === '/gfwlist.pac') {
            res.writeHead(200, {
              'Content-Type': 'application/x-ns-proxy-autoconfig'
            });
            res.end(conf);
          } else {
            res.writeHead(200);
            res.end('ok');
          }
        })
        .listen(option);
    }
  }

  private async proxyPac() {
    const { address, socksPort, HTTPPort, PACPort, PACURL } = this.getConfig();
    let URL = `http://${address}:${PACPort}/gfwlist.pac`;
    if (PACURL) {
      URL = PACURL;
    } else {
      await this.generatePAC();
    }

    const { stdout } = await execa(this.proxyPath, [
      'pac',
      address,
      socksPort,
      HTTPPort,
      URL
    ]);
    log.info(`proxy pac: ${stdout}`);
  }

  async stop() {
    if (this.PACServe) {
      this.PACServe.close();
    }
    const { stdout } = await execa(this.proxyPath, ['off']);
    log.info(`proxy off: ${stdout}`);
  }
}

export default new MacProxy();
