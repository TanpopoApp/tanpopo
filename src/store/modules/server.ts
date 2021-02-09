import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
import {
  ADD_SERVER,
  UPDATE_SERVER,
  SELECT_SERVER,
  REMOVE_SERVER,
  SYNC_SERVER
} from '../mutations.type';

import Store from 'electron-store';

export type IServer = IBasicServer | IAdvancedServer;
export interface IBasicServer {
  uuid: string;
  name: string;
  password: string;
  host: string;
  port: number;
  sni?: string;
  verify?: boolean;
  verifyHostname?: boolean;
  fastOpen?: boolean;
}

export interface IAdvancedServer {
  uuid: string;
  name: string;
  json: string;
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
  [ADD_SERVER](server: IServer) {
    this.servers.push(server);
    store.set('servers', this.servers);
  }

  @Mutation
  [UPDATE_SERVER](server: IServer) {
    const index = this.servers.findIndex(item => item.uuid === server.uuid);
    this.servers.splice(index, 1, server);
    store.set('servers', this.servers);
  }

  @Mutation
  [SELECT_SERVER](server: IServer) {
    this.selectedServer = server;
    store.set('selectedServer', server);
  }

  @Mutation
  [SYNC_SERVER]() {
    this.servers = (store.get('servers') as Array<IServer>) || [];
    this.selectedServer = (store.get('selectedServer') as IServer) || {};
  }

  @Mutation
  [REMOVE_SERVER](server: IServer) {
    const index = this.servers.findIndex(item => item.uuid === server.uuid);
    this.servers.splice(index, 1);
    store.set('servers', this.servers);
  }
}
