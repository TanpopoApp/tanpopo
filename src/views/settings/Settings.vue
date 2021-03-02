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
              prop="address"
            >
              <TanInput v-model="form.address"></TanInput>
            </FormItem>
            <FormItem
              :label="$t('views.settings.socksPort')"
              :className="$style.formItem"
              prop="socksPort"
            >
              <TanInput v-model.number="form.socksPort"></TanInput>
            </FormItem>
            <FormItem
              :label="$t('views.settings.HTTPPort')"
              :className="$style.formItem"
              prop="HTTPPort"
            >
              <TanInput v-model.number="form.HTTPPort"></TanInput>
            </FormItem>
            <FormItem
              :label="$t('views.settings.PACPort')"
              :className="$style.formItem"
              prop="PACPort"
            >
              <TanInput v-model.number="form.PACPort"></TanInput>
            </FormItem>
            <FormItem
              :label="$t('views.settings.PACURL')"
              :className="$style.formURL"
              prop="PACURL"
            >
              <TanInput
                v-model="form.PACURL"
                :placeholder="$t('views.settings.defaultPACURL')"
              ></TanInput>
            </FormItem>
            <div :class="$style.option">
              <TanSwitch v-model="form.openAtLogin">
                {{ $t('views.settings.autoStartup') }}
              </TanSwitch>
              <TanSwitch v-model="form.openAsHidden" :class="$style.button">
                {{ $t('views.settings.hiddenWindows') }}
              </TanSwitch>
              <Button
                mode="danger"
                :class="$style.button"
                @click="openConfirmClearModal"
              >
                {{ $t('views.settings.clearAll') }}
              </Button>
            </div>
            <div :class="$style.footer">
              <Button mode="normal" @click="openConfirmResetModal">
                {{ $t('views.settings.resetSettings') }}
              </Button>
              <Button type="submit" :disabled="!isValid">
                {{ $t('views.settings.saveSettings') }}
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
  START_TROJAN,
  DEFAULT_LANG,
  DEFAULT_PROXY_MODE,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT,
  DEFAULT_HTTP_PORT,
  DEFAULT_PAC_PORT
} from '@/utils/const';
import { ISettings } from '@/store/types';
import { SAVE_SETTINGS, RESET_SETTINGS } from '@/store';

const store = new Store();
const { app } = remote;
const SettingsStore = namespace('settings');

@Component
export default class Settings extends Vue {
  @SettingsStore.Getter('language') language!: string;
  @SettingsStore.Getter('enableProxy') enableProxy!: boolean;
  @SettingsStore.Getter('proxyMode') proxyMode!: string;
  @SettingsStore.Getter('address') address!: string;
  @SettingsStore.Getter('socksPort') socksPort!: number;
  @SettingsStore.Getter('HTTPPort') HTTPPort!: number;
  @SettingsStore.Getter('PACPort') PACPort!: number;
  @SettingsStore.Getter('PACURL') PACURL!: string;
  @SettingsStore.Getter('openAtLogin') openAtLogin!: boolean;
  @SettingsStore.Getter('openAsHidden') openAsHidden!: boolean;
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
    PACURL: '',
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
    return isLinux;
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

  created() {
    this.syncForm();
  }

  @Watch('proxyMode')
  onProxyModeChanged() {
    this.form.proxyMode = this.proxyMode;
  }

  syncForm() {
    this.form = {
      language: this.language,
      enableProxy: this.enableProxy,
      proxyMode: this.proxyMode,
      address: this.address,
      socksPort: this.socksPort,
      HTTPPort: this.HTTPPort,
      PACPort: this.PACPort,
      PACURL: this.PACURL,
      openAtLogin: this.openAtLogin,
      openAsHidden: this.openAsHidden
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

  clearAll() {
    store.clear();
    message.success(this.$i18n.t('views.settings.clearSuccess') as string);
    setTimeout(() => {
      location.reload();
    }, 3000);
  }

  resetSettings() {
    this.mutationResetSettings();
    message.success(this.$i18n.t('views.settings.resetSuccess') as string);
    this.syncSettings();
  }

  saveSettings() {
    this.mutationSaveSettings(this.form);
    message.success(this.$i18n.t('views.settings.saveSuccess') as string);
    this.syncSettings();
  }

  syncSettings() {
    if (this.enableProxy) {
      ipcRenderer.send(START_TROJAN);
    }
    if (this.openAsHidden) {
      app.setLoginItemSettings({
        openAtLogin: this.openAtLogin,
        openAsHidden: true,
        args: ['--hidden']
      });
    } else {
      app.setLoginItemSettings({
        openAtLogin: this.openAtLogin,
        openAsHidden: false
      });
    }

    this.$i18n.locale = this.language;
    this.syncForm();
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
  background-color: var(--color-white);
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
    width: 100%;
  }
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
