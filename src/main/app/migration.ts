import { app } from 'electron';
import { IServer, ISubscription } from '@/store/types';
import { TYPE_TROJAN } from '@/utils/const';
import store from './store';

class Migration {
  start() {
    const oldVersion = store.store.get('version');
    const version = app.getVersion();
    if (!oldVersion) {
      this.addServerType();
    }
    if (oldVersion !== version) {
      this.saveVersion(version);
    }
  }

  addServerType() {
    const serversInfo = store.servers;
    const selectedServerInfo = store.selectedServer;
    const subsInfo = store.subscriptions;
    if (!selectedServerInfo.type) {
      selectedServerInfo.type = TYPE_TROJAN;
    }
    serversInfo.forEach(server => {
      if (!server.type) {
        server.type = TYPE_TROJAN;
      }
    });
    subsInfo.forEach(sub => {
      sub.nodes!.forEach(node => {
        if (!node.type) {
          node.type = TYPE_TROJAN;
        }
      });
    });
    this.saveSelectedServer(selectedServerInfo);
    this.saveServers(serversInfo);
    this.saveSubscriptions(subsInfo);
  }

  saveServers(servers: Array<IServer>) {
    store.store.set('servers', servers);
  }

  saveSelectedServer(server: IServer) {
    store.store.set('selectedServer', server);
  }

  saveSubscriptions(subscriptions: Array<ISubscription>) {
    store.store.set('subscriptions', subscriptions);
  }

  saveVersion(version: string) {
    store.store.set('version', version);
  }
}

export default new Migration();
