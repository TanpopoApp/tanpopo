<template>
  <div :class="$style.settings">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.settings.title') }}</h1>
    </div>
    <div :class="$style.body">
      <div :class="$style.row">
        <div :class="$style.cell">
          <label :class="$style.label">
            {{ $t('views.settings.preferredLanguages') }}
          </label>
          <div :class="$style.value">
            <b-dropdown v-model="currentLang" aria-role="list">
              <button
                class="button"
                :class="$style.button"
                type="button"
                slot="trigger"
              >
                <span> {{ currentLangText }}</span>
                <b-icon icon="menu-down"></b-icon>
              </button>
              <b-dropdown-item
                :key="lang.value"
                :value="lang.value"
                aria-role="listitem"
                v-for="lang in i18nList"
              >
                {{ lang.label }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
        <div :class="$style.cell">
          <label :class="$style.label">
            {{ $t('views.settings.proxyMode') }}
          </label>
          <b-dropdown
            v-model="settings.proxyMode"
            aria-role="list"
            :disabled="disableProxyMode"
          >
            <button class="button" type="button" slot="trigger">
              <span> {{ currentProxyMode }}</span>
              <b-icon icon="menu-down"></b-icon>
            </button>
            <b-dropdown-item
              :key="mode.value"
              :value="mode.value"
              aria-role="listitem"
              v-for="mode in proxyModes"
            >
              {{ mode.label }}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
      <div :class="$style.row">
        <div :class="$style.cell">
          <label :class="$style.label">
            {{ $t('views.settings.listeningIPAddress') }}
          </label>
          <div :class="$style.value">
            <b-input v-model="settings.address"></b-input>
          </div>
        </div>
        <div :class="$style.cell">
          <label :class="$style.label">
            {{ $t('views.settings.socksPort') }}
          </label>
          <div :class="$style.value">
            <b-input v-model="settings.socksPort"></b-input>
          </div>
        </div>
      </div>
      <div :class="$style.row">
        <div :class="$style.cell">
          <label :class="$style.label">
            {{ $t('views.settings.HTTPPort') }}
          </label>
          <div :class="$style.value">
            <b-input v-model="settings.HTTPPort"></b-input>
          </div>
        </div>
        <div :class="$style.cell">
          <label :class="$style.label">
            {{ $t('views.settings.PACPort') }}
          </label>
          <div :class="$style.value">
            <b-input v-model="settings.PACPort"></b-input>
          </div>
        </div>
      </div>
      <div :class="$style.row">
        <label :class="$style.label">
          {{ $t('views.settings.PACURL') }}
        </label>
        <div :class="$style.url">
          <b-input
            v-model="settings.PACURL"
            :placeholder="$t('views.settings.defaultPACURL')"
          ></b-input>
        </div>
      </div>
      <div :class="$style.row">
        <div :class="$style.cell">
          <label :class="$style.label">
            {{ $t('views.settings.autoStartup') }}
          </label>
          <div :class="$style.value">
            <b-switch v-model="settings.openAtLogin" type="is-success">
            </b-switch>
          </div>
        </div>
      </div>
      <div :class="$style.row">
        <div :class="$style.cell">
          <b-button type="is-primary" @click="saveSettings">
            {{ $t('views.settings.saveSettings') }}
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ipcRenderer, remote } from 'electron';
import {
  START_TROJAN,
  DEFAULT_PROXY_MODE,
  DEFAULT_ADDRESS,
  DEFAULT_SOCKS_PORT,
  DEFAULT_HTTP_PORT,
  DEFAULT_PAC_PORT,
  isLinux
} from '@/utils';
import Store from 'electron-store';
import { ISettings } from '@/types';

const { app } = remote;
const store = new Store();

@Component
export default class Settings extends Vue {
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

  settings: ISettings = {
    proxyMode: DEFAULT_PROXY_MODE,
    address: DEFAULT_ADDRESS,
    socksPort: DEFAULT_SOCKS_PORT.toString(),
    HTTPPort: DEFAULT_HTTP_PORT.toString(),
    PACPort: DEFAULT_PAC_PORT.toString(),
    PACURL: '',
    openAtLogin: false
  };

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

  get currentLangText() {
    return this.i18nList.find(lang => lang.value === this.$i18n.locale)?.label;
  }

  get currentLang() {
    return this.$i18n.locale;
  }
  set currentLang(lang: string) {
    store.set('language', lang);
    this.$i18n.locale = lang;
  }

  get currentProxyMode() {
    return this.proxyModes.find(mode => mode.value === this.settings.proxyMode)
      ?.label;
  }

  mounted() {
    const settings = store.get('settings') as ISettings;
    this.settings = Object.assign(this.settings, settings);
  }

  saveSettings() {
    store.set('settings', this.settings);
    if (store.get('enableProxy')) {
      ipcRenderer.send(START_TROJAN);
    }
    app.setLoginItemSettings({
      openAtLogin: this.settings.openAtLogin
    });
    this.$buefy.toast.open({
      message: this.$i18n.t('views.settings.saved') as string,
      type: 'is-success',
      position: 'is-bottom-right'
    });
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
  font-size: 22px;
  font-weight: 500;
}
.body {
  position: relative;
  padding: 16px;
  flex: 1;
  background-color: var(--color-white);
}
.row {
  display: flex;
  margin-bottom: 24px;
}
.cell {
  width: 50%;
  display: flex;
  align-items: center;
}
.label {
  margin-right: 24px;
  min-width: 160px;
}
.button {
  width: 200px;
  justify-content: space-between;
}
.value {
  width: 200px;
}
.url {
  width: 600px;
}
</style>
