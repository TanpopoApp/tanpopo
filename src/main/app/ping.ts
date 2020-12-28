import { IBasicServer, IAdvancedServer, IServer } from '@/store/modules/server';
import { ipcMain } from 'electron';
import ping from 'pingman';
import { SEND_PING, RECEIVE_PING } from '@/utils';

class Ping {
  startPingService() {
    ipcMain.on(SEND_PING, async (event, server: IServer, uuid: string) => {
      const info = await this.getPingInfo(server);
      event.reply(RECEIVE_PING, info, uuid);
    });
  }

  async getPingInfo(server: IServer) {
    let host = '';
    if ((server as IBasicServer).host) {
      host = (server as IBasicServer).host;
    } else {
      const config = JSON.parse((server as IAdvancedServer).json);
      host = config.remote_addr;
    }
    const info = await ping(host);
    if (info.alive) {
      return {
        [server.uuid]: Math.trunc(info.avg || 0)
      };
    } else {
      return {
        [server.uuid]: 'timeout'
      };
    }
  }
}

export default new Ping();
