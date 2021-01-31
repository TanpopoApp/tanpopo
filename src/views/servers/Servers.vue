<template>
  <div :class="$style.servers">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.servers.title') }}</h1>
      <Button @click="showAddServer = true">
        {{ $t('views.servers.addServer') }}
      </Button>
    </div>
    <div :class="$style.body">
      <RadioGroup v-model="selectedServerId" :class="$style.list">
        <ServerItem
          v-for="server in servers"
          :key="server.uuid"
          :server="server"
        />
      </RadioGroup>
      <div :class="$style.empty" v-if="showEmpty">
        <img src="@/assets/empty.svg" width="96" alt="empty icon" />
        <p :class="$style.emptyText">
          {{ $t('views.servers.emptyServer') }}
        </p>
      </div>
    </div>
    <AddServer v-model="showAddServer" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ipcRenderer } from 'electron';
import { START_TROJAN } from '@/utils/const';
import { SELECT_SERVER } from '@/store';
import { IServer } from '@/store/types';
import AddServer from './components/AddServer.vue';
import ServerItem from './ServerItem.vue';

import { namespace } from 'vuex-class';

const ServerStore = namespace('server');
const SettingsStore = namespace('settings');

@Component({
  components: {
    AddServer,
    ServerItem
  }
})
export default class Servers extends Vue {
  @SettingsStore.Getter enableProxy!: boolean;
  @ServerStore.State servers!: Array<IServer>;
  @ServerStore.State selectedServer!: IServer;

  @ServerStore.Mutation(SELECT_SERVER) mutationSelectServer!: (
    server: IServer
  ) => void;

  showAddServer = false;

  get selectedServerId() {
    return this.selectedServer.uuid;
  }
  set selectedServerId(id: string) {
    const selectedServer = this.servers.find(server => server.uuid === id);
    if (selectedServer) {
      this.mutationSelectServer(selectedServer);
      if (this.enableProxy) {
        ipcRenderer.send(START_TROJAN);
      }
    }
  }

  get showEmpty() {
    return this.servers.length === 0;
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
  font-size: 18px;
  font-weight: 600;
  line-height: 32px;
}
.body {
  position: relative;
  display: flex;
  flex-direction: column;
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
</style>
