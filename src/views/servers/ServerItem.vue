<template>
  <div :class="$style.server">
    <Radio :value="server.uuid">
      <Country :country="country" />
      <span> {{ server.name }}</span>
    </Radio>
    <div :class="$style.panel">
      <label :class="pingClass">
        {{ pingResult }}
      </label>
      <button :class="$style.button" @click="openUpdateModal">
        <Icon name="edit" :className="$style.icon" />
      </button>
      <button :class="$style.button" @click="openQRCodeModal">
        <Icon name="qrcode" :className="$style.icon" />
      </button>
      <button :class="$style.button" @click="openConfirmDeleteModal">
        <Icon name="delete" :className="$style.icon" />
      </button>
    </div>
    <Modal v-model="showEdit">
      <div :class="$style.head">
        <p :class="$style.title">
          {{ $t('views.servers.editServer') }}
        </p>
        <button @click="closeUpdateModal" :class="$style.close">
          <Icon name="close" />
        </button>
      </div>
      <div :class="$style.body">
        <JSON
          v-if="isJSONServer"
          :server="server"
          @back="closeUpdateModal"
          @submit="update"
        />
        <Manual
          v-else
          :server="server"
          @back="closeUpdateModal"
          @submit="update"
        />
      </div>
      <template v-slot:footer>
        <span></span>
      </template>
    </Modal>
    <Modal v-model="confirmDelete" type="danger" @on-ok="remove">
      <p :class="$style.removeTitle">{{ confirmDeleteText }}</p>
    </Modal>
    <QRCode v-model="showQRCode" :server="server" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { ipcRenderer } from 'electron';
import { UPDATE_SERVER, REMOVE_SERVER } from '@/store';
import { IAdvancedServer, IServer } from '@/store/modules/server';
import message from '@/components/message';
import {
  SEND_PING,
  RECEIVE_PING,
  QUERY_COUNTRY,
  ANSWER_COUNTRY
} from '@/utils/const';
import Country from '@/components/Country.vue';
import Manual from './components/Manual.vue';
import JSON from './components/JSON.vue';
import QRCode from '@/components/views/QRCode.vue';
import { GeoIP } from '@/types';

const ServerStore = namespace('server');

@Component({
  components: {
    Country,
    Manual,
    JSON,
    QRCode
  }
})
export default class ServerItem extends Vue {
  @Prop({ default: () => Object.create(null) }) readonly server!: IServer;

  @ServerStore.Mutation(UPDATE_SERVER) mutationUpdateServer!: (
    server: IServer
  ) => void;
  @ServerStore.Mutation(REMOVE_SERVER) mutationRemoveServer!: (
    server: IServer
  ) => void;

  pingInfo = '';
  countryInfo: GeoIP = {} as GeoIP;
  showEdit = false;
  confirmDelete = false;
  showQRCode = false;

  get isJSONServer() {
    return !!(this.server as IAdvancedServer).json;
  }

  get confirmDeleteText() {
    return this.$i18n.t('views.servers.sureToDelete', {
      name: this.server.name
    });
  }

  get country() {
    return (
      this.countryInfo.country_code ||
      this.countryInfo.continent_code ||
      ''
    ).toLowerCase();
  }

  get pingClass() {
    if (typeof this.pingInfo === 'number') {
      return this.$style.status;
    } else {
      return `${this.$style.status} ${this.$style.error}`;
    }
  }

  get pingResult() {
    if (this.pingInfo === 'timeout') {
      return this.$i18n.t('common.timeout');
    } else if (typeof this.pingInfo === 'number') {
      return this.pingInfo + 'ms';
    } else {
      return '';
    }
  }

  mounted() {
    ipcRenderer.on(RECEIVE_PING, (event, info) => {
      if (info[this.server.uuid]) {
        this.pingInfo = info[this.server.uuid];
      }
    });
    ipcRenderer.on(ANSWER_COUNTRY, (event, info) => {
      if (info[this.server.uuid]) {
        this.countryInfo = info[this.server.uuid];
      }
    });
    ipcRenderer.send(SEND_PING, this.server);
    ipcRenderer.send(QUERY_COUNTRY, this.server);
  }

  beforeDestroy() {
    ipcRenderer.removeAllListeners(RECEIVE_PING);
    ipcRenderer.removeAllListeners(ANSWER_COUNTRY);
  }

  update(server: IServer) {
    this.mutationUpdateServer(server);
    this.closeUpdateModal();
    message.success(this.$i18n.t('views.servers.updateSuccess') as string);
  }

  remove() {
    this.mutationRemoveServer(this.server);
    this.confirmDelete = false;
    message.success(
      this.$i18n.t('views.servers.deleteSuccess', {
        name: this.server.name
      }) as string
    );
  }

  openUpdateModal() {
    this.showEdit = true;
  }
  closeUpdateModal() {
    this.showEdit = false;
  }

  openQRCodeModal() {
    this.showQRCode = true;
  }

  closeQRCodeModal() {
    this.showQRCode = false;
  }

  openConfirmDeleteModal() {
    this.confirmDelete = true;
  }
  closeConfirmDeleteModal() {
    this.confirmDelete = false;
  }
}
</script>
<style lang="postcss" module>
.server {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  transition: box-shadow 0.3s linear;

  &:hover {
    box-shadow: 0 2px 4px 0 var(--color-border);
  }
}

.panel {
  display: flex;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  &:hover {
    background-color: var(--color-hover);
  }
}

.icon {
  width: 16px;
  height: 16px;
}

.status {
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 14px;
  color: var(--color-success);
  &.error {
    color: var(--color-danger);
  }
}

.body {
  margin: 16px;
  display: flex;
  justify-content: space-between;
  overflow: auto;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.close {
  display: flex;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: var(--color-hover);
  }
}

.qrcode {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.removeTitle {
  padding: 24px;
  font-size: 16px;
  font-weight: 600;
}
</style>
