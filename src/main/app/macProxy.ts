import { app } from 'electron';
import path from 'path';
import execa from 'execa';
import http from 'http';
import fs from 'fs-extra';
import log from 'electron-log';
import port from './port';
import store from './store';

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
    const proxyMode = store.proxyMode;
    const address = store.address;
    const socksPort = store.socksPort.toString();
    const HTTPPort = store.HTTPPort.toString();
    const PACPort = store.PACPort.toString();
    const PACURL = store.PACURL;
    const userRules = store.userRules;
    return {
      proxyMode,
      address,
      socksPort,
      HTTPPort,
      PACPort,
      PACURL,
      userRules
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
    log.info(`mac proxy all: ${stdout}`);
  }

  private async generatePAC() {
    const {
      address,
      socksPort,
      HTTPPort,
      PACPort,
      userRules
    } = this.getConfig();
    const option = {
      port: Number(PACPort),
      host: address
    };

    const template = await fs.readFile(
      path.resolve(this.proxyPath, '../gfwlist.js.template'),
      'utf8'
    );

    const rules = userRules.split('\n').map(rule => rule.trim());
    const proxyRules: Dictionary<number> = {};
    const directRules: Dictionary<number> = {};
    rules.forEach(rule => {
      if (rule.startsWith('||')) {
        const host = rule.substring(2);
        proxyRules[host] = 1;
      }
      if (rule.startsWith('@@')) {
        const host = rule.substring(2);
        directRules[host] = 1;
      }
    });
    const context: Dictionary<string> = {
      proxy: `SOCKS5 ${address}:${socksPort}; PROXY ${address}:${HTTPPort};`,
      proxyRules: JSON.stringify(proxyRules),
      directRules: JSON.stringify(directRules)
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
    log.info(`mac proxy pac: ${stdout}`);
  }

  async stop() {
    if (this.PACServe) {
      this.PACServe.close();
    }
    const { stdout } = await execa(this.proxyPath, ['off']);
    log.info(`mac proxy off: ${stdout}`);
  }
}

export default new MacProxy();
