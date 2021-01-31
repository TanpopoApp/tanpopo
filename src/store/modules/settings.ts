import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
import {
  DEFAULT_LANG,
  DEFAULT_PROXY_MODE,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT,
  DEFAULT_HTTP_PORT,
  DEFAULT_PAC_PORT
} from '@/utils/const';
import {
  SAVE_SETTINGS,
  RESET_SETTINGS,
  UPDATE_PROXY,
  SYNC_SETTINGS,
  INIT_SETTINGS
} from '../mutations.type';
import Store from 'electron-store';

export interface ISettings {
  language: string;
  enableProxy: boolean;
  proxyMode: string;
  address: string;
  socksPort: number;
  HTTPPort: number;
  PACPort: number;
  PACURL: string;
  openAtLogin: boolean;
}

export interface State {
  settings: ISettings;
}

const store = new Store();

@Module({
  namespaced: true
})
export default class Settings extends VuexModule implements State {
  settings: ISettings = (store.get('settings') as ISettings) || {};

  get language() {
    return this.settings.language || DEFAULT_LANG;
  }

  get enableProxy() {
    return this.settings.enableProxy || false;
  }

  get proxyMode() {
    return this.settings.proxyMode || DEFAULT_PROXY_MODE;
  }

  get address() {
    return this.settings.address || DEFAULT_ADDRESS;
  }

  get socksPort() {
    return this.settings.socksPort || DEFAULT_SOCKS_PORT;
  }

  get HTTPPort() {
    return this.settings.HTTPPort || DEFAULT_HTTP_PORT;
  }

  get PACPort() {
    return this.settings.PACPort || DEFAULT_PAC_PORT;
  }

  get PACURL() {
    return this.settings.PACURL || '';
  }

  get openAtLogin() {
    return this.settings.openAtLogin || false;
  }

  @Mutation
  [UPDATE_PROXY](val: boolean) {
    this.settings.enableProxy = val;
    store.set('settings', this.settings);
  }

  @Mutation
  [SAVE_SETTINGS](settings: ISettings) {
    this.settings = settings;
    store.set('settings', this.settings);
  }

  @Mutation
  [SYNC_SETTINGS]() {
    this.settings = (store.get('settings') as ISettings) || {};
  }

  @Mutation
  [RESET_SETTINGS]() {
    const defaultSettings: ISettings = {
      language: DEFAULT_LANG,
      enableProxy: this.enableProxy,
      proxyMode: DEFAULT_PROXY_MODE,
      address: DEFAULT_ADDRESS,
      socksPort: DEFAULT_SOCKS_PORT,
      HTTPPort: DEFAULT_HTTP_PORT,
      PACPort: DEFAULT_PAC_PORT,
      PACURL: '',
      openAtLogin: false
    };
    this.settings = defaultSettings;
    store.set('settings', this.settings);
  }

  @Mutation
  [INIT_SETTINGS]() {
    const initSettings: ISettings = {
      language: DEFAULT_LANG,
      enableProxy: false,
      proxyMode: DEFAULT_PROXY_MODE,
      address: DEFAULT_ADDRESS,
      socksPort: DEFAULT_SOCKS_PORT,
      HTTPPort: DEFAULT_HTTP_PORT,
      PACPort: DEFAULT_PAC_PORT,
      PACURL: '',
      openAtLogin: false
    };
    this.settings = initSettings;
    store.set('settings', this.settings);
  }
}
