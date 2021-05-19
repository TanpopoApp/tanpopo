import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
import {
  DEFAULT_LANG,
  DEFAULT_PROXY_MODE,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT,
  DEFAULT_HTTP_PORT,
  DEFAULT_PAC_PORT,
  DEFAULT_THEME
} from '@/utils/const';
import {
  SAVE_SETTINGS,
  RESET_SETTINGS,
  UPDATE_PROXY,
  SYNC_SETTINGS,
  INIT_SETTINGS,
  UPDATE_LANG,
  UPDATE_PROXY_MODE,
  UPDATE_ADDRESS,
  UPDATE_SOCKS_PORT,
  UPDATE_HTTP_PORT,
  UPDATE_PAC_PORT,
  UPDATE_THEME,
  UPDATE_PAC_URL,
  UPDATE_USER_RULES,
  UPDATE_OPEN_AT_LOGIN,
  UPDATE_OPEN_AS_HIDDEN
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
  theme: string;
  PACURL: string;
  userRules: string;
  openAtLogin: boolean;
  openAsHidden: boolean;
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

  get theme() {
    return this.settings.theme || DEFAULT_THEME;
  }

  get PACURL() {
    return this.settings.PACURL || '';
  }
  get userRules() {
    return this.settings.userRules || '';
  }

  get openAtLogin() {
    return this.settings.openAtLogin || false;
  }

  get openAsHidden() {
    return this.settings.openAsHidden || false;
  }

  @Mutation
  [UPDATE_LANG](lang: string) {
    this.settings.language = lang;
    store.set('settings.language', lang);
  }

  @Mutation
  [UPDATE_PROXY](val: boolean) {
    this.settings.enableProxy = val;
    store.set('settings.enableProxy', val);
  }

  @Mutation
  [UPDATE_PROXY_MODE](val: string) {
    this.settings.proxyMode = val;
    store.set('settings.proxyMode', val);
  }

  @Mutation
  [UPDATE_ADDRESS](val: string) {
    this.settings.address = val;
    store.set('settings.address', val);
  }

  @Mutation
  [UPDATE_SOCKS_PORT](socksPort: number) {
    this.settings.socksPort = socksPort;
    store.set('settings.socksPort', socksPort);
  }

  @Mutation
  [UPDATE_HTTP_PORT](HTTPPort: number) {
    this.settings.HTTPPort = HTTPPort;
    store.set('settings.HTTPPort', HTTPPort);
  }

  @Mutation
  [UPDATE_PAC_PORT](PACPort: number) {
    this.settings.PACPort = PACPort;
    store.set('settings.PACPort', PACPort);
  }

  @Mutation
  [UPDATE_THEME](theme: string) {
    this.settings.theme = theme;
    store.set('settings.theme', theme);
  }

  @Mutation
  [UPDATE_PAC_URL](PACURL: string) {
    this.settings.PACURL = PACURL;
    store.set('settings.PACURL', PACURL);
  }

  @Mutation
  [UPDATE_USER_RULES](userRules: string) {
    this.settings.userRules = userRules;
    store.set('settings.userRules', userRules);
  }

  @Mutation
  [UPDATE_OPEN_AT_LOGIN](openAtLogin: boolean) {
    this.settings.openAtLogin = openAtLogin;
    store.set('settings.openAtLogin', openAtLogin);
  }

  @Mutation
  [UPDATE_OPEN_AS_HIDDEN](openAsHidden: boolean) {
    this.settings.openAsHidden = openAsHidden;
    store.set('settings.openAsHidden', openAsHidden);
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
      theme: DEFAULT_THEME,
      PACURL: '',
      userRules: '',
      openAtLogin: false,
      openAsHidden: false
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
      theme: DEFAULT_THEME,
      PACURL: '',
      userRules: '',
      openAtLogin: false,
      openAsHidden: false
    };
    this.settings = initSettings;
    store.set('settings', this.settings);
  }
}
