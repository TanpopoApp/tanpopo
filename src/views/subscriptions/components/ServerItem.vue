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
      <button :class="$style.button" @click="openInfoModal">
        <Icon name="detail" :className="$style.icon" />
      </button>
      <button :class="$style.button" @click="openQRCodeModal">
        <Icon name="qrcode" :className="$style.icon" />
      </button>
    </div>
    <Modal v-model="showInfo">
      <div :class="$style.head">
        <p :class="$style.title">
          {{ $t('views.servers.serverInfo') }}
        </p>
        <button @click="closeInfoModal" :class="$style.close">
          <Icon name="close" />
        </button>
      </div>
      <div :class="$style.body">
        <div :class="$style.info">
          <Form :class="$style.form" :disabled="true">
            <FormItem :label="$t('views.servers.name')" prop="name">
              <TanInput v-model="server.name"></TanInput>
            </FormItem>
            <FormItem :label="$t('views.servers.host')" prop="host">
              <TanInput v-model="server.host"></TanInput>
            </FormItem>
            <FormItem :label="$t('views.servers.port')" prop="port">
              <TanInput v-model.number="server.port"></TanInput>
            </FormItem>
            <FormItem :label="$t('views.servers.password')" prop="password">
              <TanInput v-model="server.password"></TanInput>
            </FormItem>
          </Form>
        </div>
      </div>
      <template v-slot:footer>
        <span></span>
      </template>
    </Modal>
    <QRCode v-model="showQRCode" :server="server" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ipcRenderer } from 'electron';
import { IServer } from '@/store/modules/server';
import {
  SEND_PING,
  RECEIVE_PING,
  QUERY_COUNTRY,
  ANSWER_COUNTRY
} from '@/utils/const';
import QRCode from '@/components/views/QRCode.vue';
import Country from '@/components/Country.vue';
import { GeoIP } from '@/types';

@Component({
  components: {
    Country,
    QRCode
  }
})
export default class ServerItem extends Vue {
  @Prop({ default: () => Object.create(null) }) readonly server!: IServer;

  pingInfo = '';
  countryInfo: GeoIP = {} as GeoIP;
  showInfo = false;
  showQRCode = false;

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

  openInfoModal() {
    this.showInfo = true;
  }
  closeInfoModal() {
    this.showInfo = false;
  }

  openQRCodeModal() {
    this.showQRCode = true;
  }

  closeQRCodeModal() {
    this.showQRCode = false;
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

.body {
  margin: 16px;
  display: flex;
  justify-content: space-between;
  overflow: auto;
}

.info {
  width: 640px;
  display: flex;
  justify-content: center;
}

.form {
  width: 420px;
}

.qrcode {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
