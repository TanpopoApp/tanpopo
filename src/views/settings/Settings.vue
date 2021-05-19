<template>
  <div :class="$style.settings">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.settings.title') }}</h1>
    </div>
    <div :class="$style.body">
      <div :class="$style.inner">
        <div :class="$style.container">
          <Form
            :class="$style.form"
            :model="form"
            :rules="rules"
            @on-validate="validate"
            @submit="saveSettings"
          >
            <FormItem
              :label="$t('views.settings.preferredLanguages')"
              :className="$style.formItem"
              prop="language"
            >
              <Select v-model="form.language" :popperClass="$style.popper">
                <Option
                  v-for="lang in i18nList"
                  :value="lang.value"
                  :key="lang.value"
                  :label="lang.label"
                >
                </Option>
              </Select>
            </FormItem>
            <FormItem
              :label="$t('views.settings.proxyMode')"
              :className="$style.formItem"
              :disabled="disableProxyMode"
              prop="proxyMode"
            >
              <Select v-model="form.proxyMode" :popperClass="$style.popper">
                <Option
                  v-for="mode in proxyModes"
                  :value="mode.value"
                  :key="mode.value"
                  :label="mode.label"
                >
                </Option>
              </Select>
            </FormItem>
            <FormItem
              :label="$t('views.settings.listeningIPAddress')"
              :className="$style.formItem"
              :disabled="disableOption"
              prop="address"
            >
              <TanInput v-model="form.address"></TanInput>
            </FormItem>
            <FormItem
              :label="$t('views.settings.socksPort')"
              :className="$style.formItem"
              :disabled="disableOption"
              prop="socksPort"
            >
              <TanInput v-model.number="form.socksPort"></TanInput>
            </FormItem>
            <FormItem
              :label="$t('views.settings.HTTPPort')"
              :className="$style.formItem"
              :disabled="disableOption"
              prop="HTTPPort"
            >
              <TanInput v-model.number="form.HTTPPort"></TanInput>
            </FormItem>
            <FormItem
              :label="$t('views.settings.PACPort')"
              :className="$style.formItem"
              :disabled="disableOption"
              prop="PACPort"
            >
              <TanInput v-model.number="form.PACPort"></TanInput>
            </FormItem>
            <FormItem
              :label="$t('views.settings.theme')"
              :className="$style.formItem"
              prop="theme"
            >
              <Select v-model="form.theme" :popperClass="$style.popper">
                <Option
                  v-for="theme in themes"
                  :value="theme.value"
                  :key="theme.value"
                  :label="theme.label"
                >
                </Option>
              </Select>
            </FormItem>
            <FormItem
              :label="$t('views.settings.PACURL')"
              :className="$style.formURL"
              :disabled="disableOption"
              prop="PACURL"
            >
              <TanInput
                v-model="form.PACURL"
                :placeholder="$t('views.settings.defaultPACURL')"
              >
              </TanInput>
            </FormItem>
            <FormItem
              :className="$style.formRule"
              :disabled="disableOption"
              prop="PACRule"
            >
              <Button
                mode="normal"
                :className="$style.ruleButton"
                @click="openUserRulesModal"
              >
                {{ $t('views.settings.userRules') }}
              </Button>
            </FormItem>
            <div :class="$style.option">
              <TanSwitch v-model="form.openAtLogin">
                {{ $t('views.settings.autoStartup') }}
              </TanSwitch>
              <TanSwitch v-model="form.openAsHidden" :class="$style.button">
                {{ $t('views.settings.hiddenWindows') }}
              </TanSwitch>

              <Button
                mode="normal"
                :class="$style.button"
                @click="exportSettings"
              >
                {{ $t('views.settings.exportSettings') }}
              </Button>
              <Button
                mode="normal"
                :class="$style.button"
                @click="importSettings"
              >
                {{ $t('views.settings.importSettings') }}
              </Button>
            </div>
            <div :class="$style.footer">
              <Button mode="danger" @click="openConfirmClearModal">
                {{ $t('views.settings.clearAll') }}
              </Button>
              <Button mode="normal" @click="openConfirmResetModal">
                {{ $t('views.settings.resetSettings') }}
              </Button>
            </div>
          </Form>
          <Modal v-model="confirmReset" type="danger" @on-ok="resetSettings">
            <p :class="$style.resetTitle">
              {{ $t('views.settings.sureToReset') }}
            </p>
          </Modal>
          <Modal v-model="confirmClear" type="danger" @on-ok="clearAll">
            <p :class="$style.clearTitle">
              {{ $t('views.settings.sureToClear') }}
            </p>
          </Modal>
          <UserRules
            v-model="showUserRules"
            :userRules="form.userRules"
            @submit="saveUserRules"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { ipcRenderer, remote } from 'electron';
import { namespace } from 'vuex-class';
import message from '@/components/message';
import Store from 'electron-store';
import { isLinux } from '@/utils/platform';
import {
  SYNC_THEME,
  DEFAULT_LANG,
  DEFAULT_PROXY_MODE,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT,
  DEFAULT_HTTP_PORT,
  DEFAULT_PAC_PORT,
  DEFAULT_THEME,
  EXPORT_SETTINGS,
  EXPORT_SETTINGS_SUCCESS,
  IMPORT_SETTINGS_SUCCESS,
  IMPORT_SETTINGS
} from '@/utils/const';
import { ISettings } from '@/store/types';
import {
  SAVE_SETTINGS,
  RESET_SETTINGS,
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
} from '@/store';
import UserRules from './components/UserRules.vue';

const store = new Store();
const { app } = remote;
const SettingsStore = namespace('settings');

@Component({
  components: {
    UserRules
  }
})
export default class Settings extends Vue {
  @SettingsStore.Getter('language') language!: string;
  @SettingsStore.Getter('enableProxy') enableProxy!: boolean;
  @SettingsStore.Getter('proxyMode') proxyMode!: string;
  @SettingsStore.Getter('address') address!: string;
  @SettingsStore.Getter('socksPort') socksPort!: number;
  @SettingsStore.Getter('HTTPPort') HTTPPort!: number;
  @SettingsStore.Getter('PACPort') PACPort!: number;
  @SettingsStore.Getter('theme') theme!: string;
  @SettingsStore.Getter('PACURL') PACURL!: string;
  @SettingsStore.Getter('userRules') userRules!: string;
  @SettingsStore.Getter('openAtLogin') openAtLogin!: boolean;
  @SettingsStore.Getter('openAsHidden') openAsHidden!: boolean;
  @SettingsStore.Mutation(UPDATE_LANG) mutationUpdateLang!: (
    lang: string
  ) => void;
  @SettingsStore.Mutation(UPDATE_PROXY_MODE) mutationUpdateProxyMode!: (
    proxyMode: string
  ) => void;
  @SettingsStore.Mutation(UPDATE_ADDRESS) mutationUpdateAddress!: (
    address: string
  ) => void;
  @SettingsStore.Mutation(UPDATE_SOCKS_PORT) mutationUpdateSocksPort!: (
    socksPort: number
  ) => void;
  @SettingsStore.Mutation(UPDATE_HTTP_PORT) mutationUpdateHTTPPort!: (
    HTTPPort: number
  ) => void;
  @SettingsStore.Mutation(UPDATE_PAC_PORT) mutationUpdatePACPort!: (
    PACPort: number
  ) => void;
  @SettingsStore.Mutation(UPDATE_THEME) mutationUpdateTheme!: (
    theme: string
  ) => void;
  @SettingsStore.Mutation(UPDATE_PAC_URL) mutationUpdatePACURL!: (
    PACURL: string
  ) => void;
  @SettingsStore.Mutation(UPDATE_USER_RULES) mutationUpdateUserRules!: (
    userRules: string
  ) => void;
  @SettingsStore.Mutation(UPDATE_OPEN_AT_LOGIN) mutationUpdateOpenAtLogin!: (
    openAtLogin: boolean
  ) => void;
  @SettingsStore.Mutation(UPDATE_OPEN_AS_HIDDEN) mutationUpdateOpenAsHidden!: (
    openAsHidden: boolean
  ) => void;
  @SettingsStore.Mutation(SAVE_SETTINGS) mutationSaveSettings!: (
    settings: ISettings
  ) => void;
  @SettingsStore.Mutation(RESET_SETTINGS) mutationResetSettings!: () => void;

  i18nList = [
    {
      value: 'en',
      label: 'English'
    },
    {
      value: 'zh-CN',
      label: '简体中文'
    }
  ];

  confirmReset = false;
  confirmClear = false;
  showUserRules = false;

  validateResult: Dictionary<boolean> = {
    language: true,
    enableProxy: true,
    proxyMode: true,
    address: true,
    socksPort: true,
    HTTPPort: true,
    PACPort: true,
    PACURL: true,
    openAtLogin: true
  };

  form: ISettings = {
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

  get rules() {
    const required = {
      required: true,
      message: this.$i18n.t('validation.required'),
      trigger: ['change', 'blur']
    };
    return {
      language: [required],
      proxyMode: [required],
      address: [
        required,
        {
          pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$/,
          message: this.$i18n.t('validation.type'),
          trigger: 'blur'
        }
      ],
      socksPort: [{ ...{ type: 'number' }, ...required }],
      HTTPPort: [{ ...{ type: 'number' }, ...required }],
      PACPort: [{ ...{ type: 'number' }, ...required }],
      PACURL: [
        {
          pattern: /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z+/=]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,
          message: this.$i18n.t('validation.type'),
          trigger: 'blur'
        }
      ]
    };
  }

  get isValid() {
    return Object.values(this.validateResult).every(result => result);
  }

  get disableProxyMode() {
    return isLinux || this.enableProxy;
  }

  get disableOption() {
    return this.enableProxy;
  }

  get proxyModes() {
    return [
      {
        value: 'local',
        label: this.$i18n.t('views.settings.proxyModes.local')
      },
      {
        value: 'global',
        label: this.$i18n.t('views.settings.proxyModes.global')
      },
      {
        value: 'pac',
        label: this.$i18n.t('views.settings.proxyModes.pac')
      }
    ];
  }

  get themes() {
    return [
      {
        value: 'system',
        label: this.$i18n.t('views.settings.themes.system')
      },
      {
        value: 'light',
        label: this.$i18n.t('views.settings.themes.light')
      },
      {
        value: 'dark',
        label: this.$i18n.t('views.settings.themes.dark')
      }
    ];
  }

  created() {
    this.syncForm();
    ipcRenderer.on(EXPORT_SETTINGS_SUCCESS, () => {
      message.success(this.$i18n.t('views.settings.exportSuccess') as string);
    });
    ipcRenderer.on(IMPORT_SETTINGS_SUCCESS, (event, configData: string) => {
      store.clear();
      store.set(configData);
      message.success(this.$i18n.t('views.settings.importSuccess') as string);
      this.reload();
    });
  }

  @Watch('proxyMode')
  onProxyModeChanged() {
    this.form.proxyMode = this.proxyMode;
  }

  syncForm() {
    const self = this;
    this.form = {
      get language() {
        return self.language;
      },
      set language(lang: string) {
        self.$i18n.locale = lang;
        self.mutationUpdateLang(lang);
      },
      enableProxy: this.enableProxy,
      get proxyMode() {
        return self.proxyMode;
      },
      set proxyMode(proxyMode: string) {
        self.mutationUpdateProxyMode(proxyMode);
      },
      get address() {
        return self.address;
      },
      set address(address: string) {
        self.mutationUpdateAddress(address);
      },
      get socksPort() {
        return self.socksPort;
      },
      set socksPort(socksPort: number) {
        self.mutationUpdateSocksPort(socksPort);
      },
      get HTTPPort() {
        return self.HTTPPort;
      },
      set HTTPPort(HTTPPort: number) {
        self.mutationUpdateHTTPPort(HTTPPort);
      },
      get PACPort() {
        return self.PACPort;
      },
      set PACPort(PACPort: number) {
        self.mutationUpdatePACPort(PACPort);
      },
      get theme() {
        return self.theme;
      },
      set theme(theme: string) {
        ipcRenderer.send(SYNC_THEME, theme);
        self.mutationUpdateTheme(theme);
      },
      get PACURL() {
        return self.PACURL;
      },
      set PACURL(PACURL: string) {
        self.mutationUpdatePACURL(PACURL);
      },
      get userRules() {
        return self.userRules;
      },
      set userRules(userRules: string) {
        self.mutationUpdateUserRules(userRules);
      },
      get openAtLogin() {
        return self.openAtLogin;
      },
      set openAtLogin(openAtLogin: boolean) {
        app.setLoginItemSettings({
          openAtLogin
        });
        self.mutationUpdateOpenAtLogin(openAtLogin);
      },
      get openAsHidden() {
        return self.openAsHidden;
      },
      set openAsHidden(openAsHidden: boolean) {
        if (openAsHidden) {
          app.setLoginItemSettings({
            openAsHidden: true,
            args: ['--hidden']
          });
        } else {
          app.setLoginItemSettings({
            openAsHidden: false
          });
        }
        self.mutationUpdateOpenAsHidden(openAsHidden);
      }
    };
  }

  validate(valid: boolean, prop: string) {
    this.validateResult[prop] = valid;
  }

  openConfirmResetModal() {
    this.confirmReset = true;
  }

  openConfirmClearModal() {
    this.confirmClear = true;
  }

  openUserRulesModal() {
    this.showUserRules = true;
  }

  clearAll() {
    store.clear();
    message.success(this.$i18n.t('views.settings.clearSuccess') as string);
    this.reload();
  }

  reload() {
    setTimeout(() => {
      location.reload();
    }, 3000);
  }

  exportSettings() {
    ipcRenderer.send(EXPORT_SETTINGS);
  }

  importSettings() {
    ipcRenderer.send(IMPORT_SETTINGS);
  }

  resetSettings() {
    this.mutationResetSettings();
    message.success(this.$i18n.t('views.settings.resetSuccess') as string);
  }

  saveUserRules(userRules: string) {
    this.form.userRules = userRules;
  }

  saveSettings() {
    this.mutationSaveSettings(this.form);
    message.success(this.$i18n.t('views.settings.saveSuccess') as string);
  }
}
</script>
<style lang="postcss" module>
.settings {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.head {
  display: flex;
  height: 48px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  line-height: 32px;
}
.body {
  position: relative;
  padding: 16px;
  flex: 1;
  background-color: var(--color-bg);
}

.inner {
  display: flex;
  justify-content: center;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: auto;
}

.container {
  margin: 0 auto;
  max-width: 1200px;
}

.form {
  margin: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  &Item {
    width: 430px;
  }

  &URL {
    width: 80%;
  }

  &Rule {
    width: 15%;
    display: flex;
    align-items: flex-end;
  }
}

.ruleButton {
  height: 40px;
}

.popper {
  width: 430px;
}

.option {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.button {
  margin-left: 16px;
}

.footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.resetTitle,
.clearTitle {
  padding: 24px;
  font-size: 16px;
  font-weight: 600;
}
</style>
