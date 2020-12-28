<template>
  <div :class="$style.servers">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.servers.title') }}</h1>
      <b-button type="is-primary" @click="add">
        {{ $t('views.servers.addServer') }}
      </b-button>
    </div>
    <div :class="$style.body">
      <div :class="$style.list">
        <div :class="$style.item" v-for="server in servers" :key="server.uuid">
          <div :class="$style.name">
            <b-radio
              :value="selectedServerId"
              :native-value="server.uuid"
              type="is-success"
              @click.native="selectServer(server)"
            >
              <Country :country="getCountry(countryInfo[server.uuid])" />
              {{ server.name }}
            </b-radio>
          </div>
          <div :class="$style.action">
            <label :class="pingClass(pingInfo[server.uuid])">
              {{ pingResult(pingInfo[server.uuid]) }}
            </label>
            <button :class="$style.actionButton" @click="edit(server.uuid)">
              <b-icon icon="pencil"></b-icon>
            </button>
            <button
              :class="$style.actionButton"
              @click="confirmRemove(server.uuid)"
            >
              <b-icon icon="delete"></b-icon>
            </button>
          </div>
        </div>
      </div>
      <div :class="$style.empty" v-if="showEmpty">
        <img src="@/assets/empty.svg" width="96" alt="empty icon" />
        <p :class="$style.emptyText">
          {{ $t('views.servers.emptyServer') }}
        </p>
      </div>
    </div>
    <ServerModal v-model="showAddServer" :mode="mode" :serverId="serverId" />
    <b-modal v-model="showConfirm">
      <div class="modal-card" :class="$style.confirm">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ $t('views.servers.deleteServer') }}</p>
        </header>
        <section class="modal-card-body" :class="$style.confirmBody">
          {{ $t('views.servers.sureToDelete') }}
        </section>
        <footer class="modal-card-foot" :class="$style.confirmFoot">
          <button class="button" type="button" @click="showConfirm = false">
            {{ $t('common.cancel') }}
          </button>
          <button class="button is-primary" @click="remove">
            {{ $t('common.delete') }}
          </button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import * as types from '@/store/types';
import { ipcRenderer } from 'electron';
import {
  SEND_PING,
  RECEIVE_PING,
  QUERY_COUNTRY,
  ANSWER_COUNTRY
} from '@/utils';
import { IServer } from '@/store/modules/server';
import ServerModal from './components/ServerModal.vue';
import Country from '@/components/Country.vue';
import { namespace } from 'vuex-class';
import { Dictionary, GeoIP } from '@/types';

const ServerStore = namespace('server');

@Component({
  components: {
    ServerModal,
    Country
  }
})
export default class Servers extends Vue {
  @ServerStore.State servers!: Array<IServer>;
  @ServerStore.State selectedServer!: IServer;
  @ServerStore.Mutation(types.REMOVE_SERVER) mutationRemoveServer!: (
    index: number
  ) => void;
  @ServerStore.Mutation(types.SELECT_SERVER) mutationSelectServer!: (
    server: IServer
  ) => void;

  mode = 'add';
  showAddServer = false;
  serverId = '';
  pingInfo: Dictionary<string> = {};
  countryInfo: Dictionary<string> = {};

  showConfirm = false;

  get selectedServerId() {
    return this.selectedServer.uuid;
  }

  get showEmpty() {
    return this.servers.length === 0;
  }

  mounted() {
    ipcRenderer.on(RECEIVE_PING, (event, info) => {
      this.pingInfo = Object.assign({}, this.pingInfo, info);
    });
    ipcRenderer.on(ANSWER_COUNTRY, (event, info) => {
      this.countryInfo = Object.assign({}, this.countryInfo, info);
    });
    this.checkInfo();
  }

  beforeDestroy() {
    ipcRenderer.removeAllListeners(RECEIVE_PING);
    ipcRenderer.removeAllListeners(ANSWER_COUNTRY);
  }

  selectServer(server: IServer) {
    this.mutationSelectServer(server);
  }

  checkInfo() {
    this.servers.forEach(server => {
      ipcRenderer.send(SEND_PING, server);
      ipcRenderer.send(QUERY_COUNTRY, server);
    });
  }

  getCountry(info?: GeoIP) {
    if (info) {
      return (info.country_code || info.continent_code || '').toLowerCase();
    }
  }

  pingClass(info?: string | number) {
    if (typeof info === 'number') {
      return this.$style.status;
    } else {
      return `${this.$style.status} ${this.$style.error}`;
    }
  }

  pingResult(result?: string | number) {
    if (result === 'timeout') {
      return this.$i18n.t('common.timeout');
    } else if (typeof result === 'number') {
      return result + 'ms';
    } else {
      return '';
    }
  }

  add() {
    this.mode = 'add';
    this.showAddServer = true;
  }

  edit(uuid: string) {
    this.serverId = uuid;
    this.mode = 'edit';
    this.showAddServer = true;
  }

  confirmRemove(uuid: string) {
    this.serverId = uuid;
    this.showConfirm = true;
  }

  remove() {
    const index = this.servers.findIndex(item => item.uuid === this.serverId);
    if (index > -1) {
      this.mutationRemoveServer(index);
    }
    this.showConfirm = false;
  }
}
</script>
<style lang="postcss" module>
.servers {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.head {
  display: flex;
  justify-content: space-between;
  height: 48px;
}
.title {
  font-size: 22px;
  font-weight: 500;
}
.body {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  flex: 1;
  background-color: var(--color-white);
}
.empty {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  &Text {
    margin-top: 14px;
    font-size: 16px;
    color: var(--color-secondary);
  }
}
.list {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: auto;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding: 8px;
}
.name {
  display: block;

  & :global {
    .control-label {
      display: flex;
      align-items: center;
    }
  }
}
.action {
  display: flex;
  align-items: center;
}
.status {
  padding: 0 8px;
  font-size: 14px;
  color: var(--color-success);
}
.error {
  color: var(--color-danger);
}
.action {
  display: flex;
  align-items: center;
  &Button {
    display: flex;
    padding: 8px;
    border-radius: 50%;
    outline: none;
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;

    &:hover {
      background-color: var(--color-hover);
    }
  }
}

.confirm {
  margin: 0 auto !important;
  background-color: var(--color-white);
  &Body {
    text-align: center;
  }

  &Foot {
    display: flex;
    justify-content: space-between;
  }
}
</style>
