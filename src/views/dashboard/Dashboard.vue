<template>
  <div :class="$style.dashboard">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.dashboard.title') }}</h1>
    </div>
    <div :class="$style.body">
      <div :class="$style.item">
        <label :class="$style.label">
          {{ $t('views.dashboard.networkStatus') }}
        </label>
        <span :class="$style.value"> {{ networkStatus }} </span>
      </div>
      <div :class="$style.item">
        <label :class="$style.label">
          {{ $t('views.dashboard.proxySettings') }}
        </label>
        <span :class="$style.value">
          {{ status }}
        </span>
        <b-switch v-model="enableStatus" type="is-success"> </b-switch>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';
import { IServer } from '@/store/modules/server';
import { START_TROJAN, STOP_TROJAN, USED_PORT } from '@/utils';
import { namespace } from 'vuex-class';

const ServerStore = namespace('server');
const store = new Store();

@Component
export default class Dashboard extends Vue {
  @ServerStore.State selectedServer!: IServer;
  enableProxy: boolean = !!store.get('enableProxy') as boolean;

  get networkStatus() {
    if (navigator.onLine) {
      return this.$i18n.t('common.onLine');
    } else {
      return this.$i18n.t('common.offLine');
    }
  }

  get enableStatus() {
    return this.enableProxy;
  }
  set enableStatus(val: boolean) {
    this.enableProxy = val;
    store.set('enableProxy', val);
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
  mounted() {
    ipcRenderer.on(USED_PORT, (event, port) => {
      this.$buefy.toast.open({
        message: this.$i18n.t('views.dashboard.usedPort', { port }) as string,
        type: 'is-danger',
        position: 'is-bottom-right'
      });
      this.enableStatus = false;
    });
  }

  beforeDestroy() {
    ipcRenderer.removeAllListeners(USED_PORT);
  }

  @Watch('enableProxy')
  onEnableChanged() {
    if (this.enableProxy) {
      if (this.hasSelectedServer) {
        ipcRenderer.send(START_TROJAN);
      } else {
        this.$buefy.toast.open({
          message: this.$i18n.t('views.dashboard.startTips') as string,
          type: 'is-danger',
          position: 'is-bottom-right'
        });
        this.$nextTick(() => {
          this.enableStatus = false;
        });
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
  font-size: 22px;
  font-weight: 500;
}
.body {
  padding: 16px;
  flex: 1;
  background-color: var(--color-white);
}
.item {
  display: flex;
  margin: 8px 0;
}
.label {
  width: 240px;
}
.value {
  margin: 0 24px;
  display: flex;
  align-items: center;
  min-width: 200px;
}
</style>
