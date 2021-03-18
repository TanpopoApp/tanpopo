<template>
  <div :class="$style.dashboard">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.dashboard.title') }}</h1>
    </div>
    <div :class="$style.body">
      <div :class="$style.inner">
        <div :class="$style.item">
          <label :class="$style.label">
            {{ $t('views.dashboard.networkStatus') }}
          </label>
          <div :class="$style.content">{{ networkStatus }}</div>
        </div>
        <div :class="$style.item">
          <label :class="$style.label">
            {{ $t('views.dashboard.proxySettings') }}
          </label>
          <div :class="$style.content">
            <TanSwitch v-model="enableStatus" :disabled="!hasSelectedServer" />
            <span :class="$style.serverName">
              {{ status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { ipcRenderer } from 'electron';
import { IServer } from '@/store/modules/server';
import { START_TROJAN, STOP_TROJAN } from '@/utils/const';
import { namespace } from 'vuex-class';
import { UPDATE_PROXY } from '@/store';

const ServerStore = namespace('server');
const SettingsStore = namespace('settings');

@Component
export default class Dashboard extends Vue {
  @ServerStore.State selectedServer!: IServer;
  @SettingsStore.Getter enableProxy!: boolean;
  @SettingsStore.Mutation(UPDATE_PROXY) mutationUpdateProxy!: (
    val: boolean
  ) => void;

  get networkStatus() {
    if (navigator.onLine) {
      return this.$i18n.t('common.online');
    } else {
      return this.$i18n.t('common.offline');
    }
  }

  get enableStatus() {
    return this.enableProxy;
  }
  set enableStatus(val: boolean) {
    this.mutationUpdateProxy(val);
  }

  get hasSelectedServer() {
    return this.selectedServer.uuid;
  }

  get status() {
    if (this.enableStatus && this.hasSelectedServer) {
      return this.selectedServer.name;
    } else {
      return this.$i18n.t('views.dashboard.notConnected');
    }
  }

  @Watch('enableProxy')
  onEnableChanged() {
    if (this.enableProxy) {
      if (this.hasSelectedServer) {
        ipcRenderer.send(START_TROJAN);
      }
    } else {
      ipcRenderer.send(STOP_TROJAN);
    }
  }
}
</script>
<style lang="postcss" module>
.dashboard {
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
  flex: 1;
  background-color: var(--color-bg);
}

.inner {
  margin: 16px 24px;
  width: 640px;
}
.item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 0;
}
.label {
  display: block;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.serverName {
  max-width: 400px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
