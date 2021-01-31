import { app } from 'electron';
import path from 'path';
import execa from 'execa';
import http from 'http';
import fs from 'fs-extra';
import log from 'electron-log';
import port from './port';
import store from './store';

class WinProxy {
  proxyPath: string;

  PACServe: http.Server | undefined;

  constructor() {
    if (app.isPackaged) {
      this.proxyPath = path.resolve(
        process.resourcesPath,
        'helper',
        'sysproxy'
      );
    } else {
      this.proxyPath = path.resolve('src/helper', process.platform, 'sysproxy');
    }
  }

  private getConfig() {
    const proxyMode = store.proxyMode;
    const address = store.address;
    const socksPort = store.socksPort.toString();
    const HTTPPort = store.HTTPPort.toString();
    const PACPort = store.PACPort.toString();
    const PACURL = store.PACURL;
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
    const { address, HTTPPort } = this.getConfig();
    const proxyServer = `${address}:${HTTPPort}`;
    const lanIP =
      'localhost;127.*;10.*;172.16.*;172.17.*;172.18.*;172.19.*;172.20.*;172.21.*;172.22.*;172.23.*;172.24.*;172.25.*;172.26.*;172.27.*;172.28.*;172.29.*;172.30.*;172.31.*;192.168.*';

    const { stdout } = await execa(this.proxyPath, [
      'global',
      proxyServer,
      lanIP
    ]);
    log.info(`win proxy all: ${stdout}`);
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
    const { address, PACPort, PACURL } = this.getConfig();
    let URL = `http://${address}:${PACPort}/gfwlist.pac`;
    if (PACURL) {
      URL = PACURL;
    } else {
      await this.generatePAC();
    }
    const { stdout } = await execa(this.proxyPath, ['pac', URL]);
    log.info(`win proxy pac: ${stdout}`);
  }

  async stop() {
    if (this.PACServe) {
      this.PACServe.close();
    }
    const { stdout } = await execa(this.proxyPath, ['set', '1', '-', '-', '-']);
    log.info(`win proxy off: ${stdout}`);
  }
}

export default new WinProxy();
