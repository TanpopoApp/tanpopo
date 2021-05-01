<template>
  <Modal v-model="showModal" :ok-text="$t('common.copy')" @on-ok="copyURL">
    <div :class="$style.head">
      <p :class="$style.title">
        {{ $t('views.servers.qrCode') }}
      </p>
      <button @click="closeQRCodeModal" :class="$style.close">
        <Icon name="close" />
      </button>
    </div>
    <div :class="$style.qrcode">
      <img :src="qrcodeURL" width="160" height="160" alt="QR Code" />
      <span :class="$style.url">{{ url }}</span>
    </div>
  </Modal>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import QRCodeLib from 'qrcode';
import { IAdvancedServer, IServer } from '@/store/modules/server';
import message from '@/components/message';
import { copyText } from '@/utils/util';
import { TYPE_TROJAN, TYPE_SS } from '@/utils/const';

@Component
export default class QRCode extends Vue {
  @Prop({ default: false, type: Boolean }) readonly value!: boolean;
  @Prop({ default: () => Object.create(null) }) readonly server!: IServer;

  qrcodeURL = '';
  url = '';

  @Watch('showModal')
  onShowModal() {
    if (this.showModal) {
      this.generateQRCode();
    }
  }

  get showModal() {
    return this.value;
  }
  set showModal(val: boolean) {
    this.$emit('input', val);
  }

  get isJSONServer() {
    return !!(this.server as IAdvancedServer).json;
  }

  generateQRCode() {
    if (!this.qrcodeURL) {
      const serverInfo = this.isJSONServer
        ? window.JSON.parse((this.server as IAdvancedServer).json)
        : this.server;
      switch (serverInfo.type) {
        case TYPE_TROJAN: {
          this.url = `trojan://${serverInfo.password}@${serverInfo.host}:${serverInfo.port}#${serverInfo.name}`;
          break;
        }
        case TYPE_SS: {
          const info = `${serverInfo.method}:${serverInfo.password}@${serverInfo.host}:${serverInfo.port}`;
          this.url = `ss://${btoa(info)}#${serverInfo.name}`;
          break;
        }
      }
      QRCodeLib.toDataURL(this.url, { width: 320 }).then(dataURL => {
        this.qrcodeURL = dataURL;
      });
    }
  }

  closeQRCodeModal() {
    this.showModal = false;
  }

  copyURL() {
    const result = copyText(this.url);
    if (result) {
      message.success(this.$i18n.t('common.copySuccess') as string);
    } else {
      message.warning(this.$i18n.t('common.copyFailed') as string);
    }
  }
}
</script>
<style lang="postcss" module>
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.url {
  max-width: 480px;
  font-size: 18px;
  word-break: break-all;
}
</style>
