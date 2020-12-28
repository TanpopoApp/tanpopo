import { IBasicServer, IAdvancedServer, IServer } from '@/store/modules/server';
import { ipcMain } from 'electron';
import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import { promises as dns } from 'dns';
import { GeoIP } from '@/types';
import { QUERY_COUNTRY, ANSWER_COUNTRY, isIPv4, isIPv6 } from '@/utils';

class Country {
  startQueryCountryService() {
    ipcMain.on(QUERY_COUNTRY, async (event, server: IServer, uuid: string) => {
      const info = await this.getCountryInfo(server);
      event.reply(
        ANSWER_COUNTRY,
        {
          [server.uuid]: info
        },
        uuid
      );
    });
  }

  sendRequest(url: RequestInfo, options?: RequestInit): Promise<any> {
    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              resolve(data);
            });
          } else {
            reject(response);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  async getCountryInfo(server: IServer) {
    let host = '';
    if ((server as IBasicServer).host) {
      host = (server as IBasicServer).host;
    } else {
      const config = JSON.parse((server as IAdvancedServer).json);
      host = config.remote_addr;
    }
    if (isIPv4(host) || isIPv6(host)) {
      return await this.queryGeoInfo(host);
    } else {
      try {
        const { address } = await dns.lookup(host);
        return await this.queryGeoInfo(address);
      } catch {
        return null;
      }
    }
  }

  async queryGeoInfo(address: string) {
    const url = `https://api.ip.sb/geoip/${address}`;
    const response: GeoIP = await this.sendRequest(url);
    return response;
  }
}

export default new Country();
