import Store from 'electron-store';
import {
  DEFAULT_LANG,
  DEFAULT_PROXY_MODE,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT,
  DEFAULT_HTTP_PORT,
  DEFAULT_PAC_PORT,
  SYNC_STORE
} from '@/utils/const';
import { IServer, ISettings } from '@/store/types';
import { appWindow } from './window';

class Storage {
  store = new Store();
  settings: ISettings;
  constructor() {
    this.settings = (this.store.get('settings') as ISettings) || {};
  }

  getStore() {
    this.settings = (this.store.get('settings') as ISettings) || {};
  }

  saveStore() {
    this.store.set('settings', this.settings);
    if (appWindow.win) {
      appWindow.win.webContents.send(SYNC_STORE);
    }
  }

  get selectedServer() {
    return (this.store.get('selectedServer') as IServer) || {};
  }

  get language() {
    this.getStore();
    return this.settings.language || DEFAULT_LANG;
  }

  get enableProxy() {
    this.getStore();
    return this.settings.enableProxy || false;
  }
  set enableProxy(val: boolean) {
    this.settings.enableProxy = val;
    this.saveStore();
  }

  get proxyMode() {
    this.getStore();
    return this.settings.proxyMode || DEFAULT_PROXY_MODE;
  }
  set proxyMode(val: string) {
    this.settings.proxyMode = val;
    this.saveStore();
  }

  get address() {
    this.getStore();
    return this.settings.address || DEFAULT_ADDRESS;
  }

  get socksPort() {
    this.getStore();
    return this.settings.socksPort || DEFAULT_SOCKS_PORT;
  }

  get HTTPPort() {
    this.getStore();
    return this.settings.HTTPPort || DEFAULT_HTTP_PORT;
  }

  get PACPort() {
    this.getStore();
    return this.settings.PACPort || DEFAULT_PAC_PORT;
  }

  get PACURL() {
    this.getStore();
    return this.settings.PACURL || '';
  }

  get openAtLogin() {
    this.getStore();
    return this.settings.openAtLogin || false;
  }
}

export default new Storage();
