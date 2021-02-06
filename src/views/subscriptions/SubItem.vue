<template>
  <div :class="$style.subItem">
    <div :class="$style.subInfo" @dblclick="toggleServer">
      <div :class="$style.info">
        <span :class="$style.name">{{ subInfo.name }}</span>
        <span :class="$style.date">{{ localDate }}</span>
      </div>
      <div :class="$style.panel">
        <button :class="$style.button" @click.stop="toggleServer">
          <Icon :name="serverIcon" :className="$style.icon" />
        </button>
        <button :class="$style.button" @click.stop="updateNodes">
          <Icon name="refresh" :className="$style.icon" />
        </button>
        <button :class="$style.button" @click.stop="openUpdateModal">
          <Icon name="edit" :className="$style.icon" />
        </button>
        <button :class="$style.button" @click.stop="openConfirmDeleteModal">
          <Icon name="delete" :className="$style.icon" />
        </button>
      </div>
    </div>
    <div :class="$style.servers" v-if="showServer">
      <RadioGroup v-model="selectedServerId">
        <ServerItem
          v-for="node in subInfo.nodes"
          :key="node.uuid"
          :server="node"
        />
      </RadioGroup>
    </div>
    <SubModal v-model="showEdit" :subInfo="subInfo" />
    <Modal v-model="confirmDelete" type="danger" @on-ok="remove">
      <p :class="$style.removeTitle">{{ confirmDeleteText }}</p>
    </Modal>
  </div>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { ISubscription, IServer } from '@/store/types';
import { getSubscriptionNodes } from '@/utils/resolveSub';
import ServerItem from './components/ServerItem.vue';
import SubModal from './components/SubModal.vue';
import message from '@/components/message';
import { ipcRenderer } from 'electron';
import { formatDate } from '@/utils/util';
import { START_TROJAN } from '@/utils/const';
import {
  SELECT_SERVER,
  UPDATE_SUBSCRIPTION,
  REMOVE_SUBSCRIPTION
} from '@/store';
import { namespace } from 'vuex-class';

const ServerStore = namespace('server');
const SubscriptionStore = namespace('subscription');
const SettingsStore = namespace('settings');

@Component({
  components: {
    ServerItem,
    SubModal
  }
})
export default class SubItem extends Vue {
  @Prop({ default: () => Object.create(null) })
  readonly subInfo!: ISubscription;
  @SettingsStore.Getter enableProxy!: boolean;
  @ServerStore.State selectedServer!: IServer;

  @ServerStore.Mutation(SELECT_SERVER) mutationSelectServer!: (
    server: IServer
  ) => void;
  @SubscriptionStore.Mutation(UPDATE_SUBSCRIPTION)
  mutationUpdateSubscription!: (subscription: ISubscription) => void;
  @SubscriptionStore.Mutation(REMOVE_SUBSCRIPTION)
  mutaintRemoveSubscription!: (subscription: ISubscription) => void;

  showServer = false;
  showEdit = false;
  confirmDelete = false;

  get selectedServerId() {
    return this.selectedServer.uuid;
  }
  set selectedServerId(id: string) {
    const selectedServer = this.subInfo.nodes?.find(
      server => server.uuid === id
    );
    if (selectedServer) {
      this.mutationSelectServer(selectedServer);
      if (this.enableProxy) {
        ipcRenderer.send(START_TROJAN);
      }
    }
  }

  get confirmDeleteText() {
    return this.$i18n.t('views.subscriptions.sureToDelete', {
      name: this.subInfo.name
    });
  }

  get serverIcon() {
    if (this.showServer) {
      return 'server';
    } else {
      return 'bars';
    }
  }

  get localDate() {
    if (this.subInfo.updated) {
      return formatDate(this.subInfo.updated);
    } else {
      return '';
    }
  }

  toggleServer() {
    this.showServer = !this.showServer;
  }

  async updateNodes() {
    const nodes = await getSubscriptionNodes(this.subInfo.URL);
    if (Array.isArray(nodes) && nodes.length > 0) {
      const subscription: ISubscription = {
        ...this.subInfo,
        ...{
          updated: new Date().toISOString(),
          nodes
        }
      };
      this.mutationUpdateSubscription(subscription);
      message.success(
        this.$i18n.t('views.subscriptions.updateSuccess') as string
      );
    } else {
      message.warning(this.$i18n.t('views.subscriptions.errorURL') as string);
    }
  }

  openUpdateModal() {
    this.showEdit = true;
  }

  remove() {
    this.mutaintRemoveSubscription(this.subInfo);
    this.confirmDelete = false;
    message.success(
      this.$i18n.t('views.subscriptions.deleteSuccess', {
        name: this.subInfo.name
      }) as string
    );
  }
  openConfirmDeleteModal() {
    this.confirmDelete = true;
  }
}
</script>
<style lang="postcss" module>
.subItem {
  display: block;
}
.subInfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  transition: box-shadow 0.3s linear;
  cursor: pointer;

  &:hover {
    box-shadow: 0 2px 4px 0 var(--color-border);
  }
}
.info {
  display: block;
}
.name {
  display: flex;
  align-items: center;
}
.date {
  font-size: 12px;
  color: var(--color-secondary);
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
.servers {
  display: block;
}
.removeTitle {
  padding: 24px;
  font-size: 16px;
  font-weight: 600;
}
</style>
