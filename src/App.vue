<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import message from '@/components/message';
import { ipcRenderer } from 'electron';
import { namespace } from 'vuex-class';
import { SYNC_STORE, USED_PORT } from './utils/const';
import {
  INIT_SETTINGS,
  SYNC_SETTINGS,
  UPDATE_PROXY,
  SYNC_SERVER
} from '@/store';
import { ISettings } from './store/types';
const SettingsStore = namespace('settings');
const ServerStore = namespace('server');

@Component
export default class App extends Vue {
  @SettingsStore.State settings!: ISettings;
  @SettingsStore.Getter enableProxy!: boolean;
  @SettingsStore.Mutation(SYNC_SETTINGS) mutationSyncSettings!: () => void;
  @SettingsStore.Mutation(INIT_SETTINGS) mutationInitSettings!: () => void;
  @SettingsStore.Mutation(UPDATE_PROXY) mutationUpdateProxy!: (
    val: boolean
  ) => void;
  @ServerStore.Mutation(SYNC_SERVER) mutationSyncServer!: () => void;

  get enableStatus() {
    return this.enableProxy;
  }
  set enableStatus(val: boolean) {
    this.mutationUpdateProxy(val);
  }

  created() {
    ipcRenderer.on(SYNC_STORE, () => {
      this.mutationSyncSettings();
      this.mutationSyncServer();
    });
    ipcRenderer.on(USED_PORT, (event, port) => {
      message.warning(
        this.$i18n.t('views.dashboard.usedPort', { port }) as string
      );
      this.enableStatus = false;
    });
    if (Object.keys(this.settings).length === 0) {
      this.mutationInitSettings();
    }
  }
  beforeDestroy() {
    ipcRenderer.removeAllListeners(SYNC_STORE);
    ipcRenderer.removeAllListeners(USED_PORT);
  }
}
</script>
<style lang="postcss">
html,
body {
  height: 100%;
  font-family: 'Open Sans', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue',
    'Hiragino Sans GB', 'WenQuanYi Micro Hei', Arial, sans-serif;
  color: var(--color-main);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
}

a {
  color: var(--color-main);
  text-decoration: none;

  &:hover {
    color: var(--color-main);
  }
}

#app {
  height: 100%;
}

button {
  outline: none;
  border: none;
}
</style>
