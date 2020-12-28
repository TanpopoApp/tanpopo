import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
import * as types from '../types';
import { ipcRenderer } from 'electron';
import { START_TROJAN } from '@/utils';
import Store from 'electron-store';

export type IServer = IBasicServer | IAdvancedServer;
export interface IBasicServer {
  uuid: string;
  name: string;
  password: string;
  host: string;
  port: string;
  sni?: string;
  verify?: boolean;
  verifyHostname?: boolean;
  fastOpen?: boolean;
}

export interface IAdvancedServer {
  uuid: string;
  name: string;
  json: any;
}

export interface State {
  servers: Array<IServer>;
}

const store = new Store();

@Module({
  namespaced: true
})
export default class Server extends VuexModule implements State {
  servers: Array<IServer> = (store.get('servers') as Array<IServer>) || [];
  selectedServer: IServer = (store.get('selectedServer') as IServer) || {};

  @Mutation
  [types.ADD_SERVER](server: IServer) {
    this.servers.push(server);
    store.set('servers', this.servers);
  }

  @Mutation
  [types.UPDATE_SERVER](server: IServer) {
    const index = this.servers.findIndex(item => item.uuid === server.uuid);
    this.servers.splice(index, 1, server);
    store.set('servers', this.servers);
  }

  @Mutation
  [types.SELECT_SERVER](server: IServer) {
    this.selectedServer = server;
    store.set('selectedServer', server);
    if (store.get('enableProxy')) {
      ipcRenderer.send(START_TROJAN);
    }
  }

  @Mutation
  [types.REMOVE_SERVER](index: number) {
    this.servers.splice(index, 1);
    store.set('servers', this.servers);
  }
}
