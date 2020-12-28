<template>
  <div :class="$style.subscription">
    <div :class="$style.subInfo">
      <div :class="$style.info">
        <span :class="$style.name">{{ subInfo.name }}</span>
        <span :class="$style.date">{{ localDate }}</span>
      </div>
      <div :class="$style.action">
        <button
          :class="$style.actionButton"
          @click="toggleExpand(subInfo.uuid)"
        >
          <b-icon :icon="expandIcon"></b-icon>
        </button>
        <button :class="$style.actionButton" @click="refresh(subInfo)">
          <b-icon icon="refresh"></b-icon>
        </button>
        <button :class="$style.actionButton" @click="edit(subInfo.uuid)">
          <b-icon icon="pencil"></b-icon>
        </button>
        <button
          :class="$style.actionButton"
          @click="confirmRemove(subInfo.uuid)"
        >
          <b-icon icon="delete"></b-icon>
        </button>
      </div>
    </div>
    <div :class="$style.subNodes" v-if="subInfo.nodes" v-show="expand">
      <div
        :class="$style.nodeInfo"
        v-for="node in subInfo.nodes"
        :key="node.uuid"
      >
        <div :class="$style.name">
          <b-radio
            :value="selectedServerId"
            :native-value="node.uuid"
            type="is-success"
            @click.native="selectServer(node)"
          >
            <Country :country="getCountry(countryInfo[node.uuid])" />
            {{ node.name }}
          </b-radio>
        </div>
        <div :class="$style.action">
          <label :class="pingClass(pingInfo[node.uuid])">
            {{ pingResult(pingInfo[node.uuid]) }}
          </label>
          <button :class="$style.actionButton" @click="showInfo(node)">
            <b-icon icon="information"></b-icon>
          </button>
        </div>
      </div>
    </div>
    <SubscriptionModal
      v-model="showSubscription"
      mode="edit"
      :subId="subInfo.uuid"
    />
    <ServerModal v-model="showServerInfo" :serverInfo="serverInfo" />
    <b-modal v-model="showConfirm">
      <div class="modal-card" :class="$style.confirm">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ $t('views.subscriptions.deleteSubscription') }}
          </p>
        </header>
        <section class="modal-card-body" :class="$style.confirmBody">
          {{ $t('views.subscriptions.sureToDelete') }}
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
import { Component, Vue, Prop } from 'vue-property-decorator';
import * as types from '@/store/types';
import SubscriptionModal from './SubscriptionModal.vue';
import ServerModal from './ServerModal.vue';
import { ipcRenderer } from 'electron';
import { ISubscription } from '@/store/modules/subscription';
import {
  formatDate,
  SEND_PING,
  RECEIVE_PING,
  QUERY_COUNTRY,
  ANSWER_COUNTRY
} from '@/utils';
import { Dictionary, GeoIP } from '@/types';
import { namespace } from 'vuex-class';
import Country from '@/components/Country.vue';
import { IServer } from '@/store/modules/server';
const SubscriptionStore = namespace('subscription');
const ServerStore = namespace('server');

@Component({
  components: {
    SubscriptionModal,
    ServerModal,
    Country
  }
})
export default class Subscription extends Vue {
  @Prop() readonly subInfo!: ISubscription;
  @SubscriptionStore.State subscriptions!: Array<ISubscription>;
  @SubscriptionStore.Action(types.UPDATE_SUBSCRIPTION)
  actionUpdateSubscription!: (subscription: ISubscription) => void;
  @SubscriptionStore.Mutation(types.REMOVE_SUBSCRIPTION)
  mutaintRemoveSubscription!: (index: number) => void;
  @ServerStore.State selectedServer!: IServer;
  @ServerStore.Mutation(types.SELECT_SERVER) mutationSelectServer!: (
    server: IServer
  ) => void;

  showSubscription = false;
  showServerInfo = false;
  serverInfo = {} as IServer;
  showConfirm = false;
  mode = 'edit';
  subId = '';
  expand = false;
  pingInfo: Dictionary<string> = {};
  countryInfo: Dictionary<string> = {};

  get expandIcon() {
    if (this.expand) {
      return 'server';
    } else {
      return 'menu';
    }
  }

  get selectedServerId() {
    return this.selectedServer.uuid;
  }

  get localDate() {
    if (this.subInfo.updated) {
      return formatDate(this.subInfo.updated);
    } else {
      return '';
    }
  }

  mounted() {
    ipcRenderer.on(RECEIVE_PING, (event, info, uuid: string) => {
      if (this.subInfo.uuid === uuid) {
        this.pingInfo = Object.assign({}, this.pingInfo, info);
      }
    });
    ipcRenderer.on(ANSWER_COUNTRY, (event, info, uuid: string) => {
      if (this.subInfo.uuid === uuid) {
        this.countryInfo = Object.assign({}, this.countryInfo, info);
      }
    });
  }

  beforeDestroy() {
    ipcRenderer.removeAllListeners(RECEIVE_PING);
    ipcRenderer.removeAllListeners(ANSWER_COUNTRY);
  }

  checkInfo() {
    this.subInfo.nodes?.forEach(node => {
      ipcRenderer.send(SEND_PING, node, this.subInfo.uuid);
      ipcRenderer.send(QUERY_COUNTRY, node, this.subInfo.uuid);
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

  selectServer(node: IServer) {
    this.mutationSelectServer(node);
  }

  showInfo(serverInfo: IServer) {
    this.serverInfo = serverInfo;
    this.showServerInfo = true;
  }

  toggleExpand(uuid: string) {
    this.expand = !this.expand;
    if (this.expand) {
      this.subId = uuid;
      this.checkInfo();
    }
  }

  edit(uuid: string) {
    this.subId = uuid;
    this.showSubscription = true;
  }

  refresh(subInfo: ISubscription) {
    this.actionUpdateSubscription(subInfo);
  }

  confirmRemove(uuid: string) {
    this.subId = uuid;
    this.showConfirm = true;
  }

  remove() {
    const index = this.subscriptions.findIndex(sub => sub.uuid === this.subId);
    if (index > -1) {
      this.mutaintRemoveSubscription(index);
    }
    this.showConfirm = false;
  }
}
</script>
<style lang="postcss" module>
.subscription {
  display: block;
}
.subInfo,
.nodeInfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding: 8px;
}
.subNodes {
  display: block;
}
.info {
  display: block;
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
.date {
  font-size: 12px;
  color: var(--color-secondary);
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
