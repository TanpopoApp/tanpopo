<template>
  <Modal v-model="showModal">
    <div :class="$style.head">
      <p :class="$style.title">
        {{ $t('views.servers.addServer') }}
      </p>
      <button @click="close" :class="$style.close">
        <Icon name="close" />
      </button>
    </div>
    <div :class="$style.body">
      <template v-if="selectMode">
        <button :class="$style.server" @click="select('manual')">
          <Icon name="edit" :className="$style.icon" />
          <span :class="$style.name">{{ $t('views.servers.add.manual') }}</span>
        </button>
        <button :class="$style.server" @click="select('URL')">
          <Icon name="link" :className="$style.icon" />
          <span :class="$style.name">{{ $t('views.servers.add.URL') }}</span>
        </button>
        <button :class="$style.server" @click="select('json')">
          <Icon name="file" :className="$style.icon" />
          <span :class="$style.name">{{ $t('views.servers.add.json') }}</span>
        </button>
      </template>
      <Manual v-if="manualMode" @back="back" @submit="add" />
      <URL v-if="URLMode" @back="back" @submit="add" />
      <JSON v-if="JSONMode" @back="back" @submit="add" />
    </div>
    <template v-slot:footer>
      <span></span>
    </template>
  </Modal>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import { IServer } from '@/store/types';
import message from '@/components/message';
import { ADD_SERVER } from '@/store';
import { namespace } from 'vuex-class';
import Manual from './Manual.vue';
import URL from './URL.vue';
import JSON from './JSON.vue';

const ServerStore = namespace('server');

type Mode = 'select' | 'manual' | 'URL' | 'json';

@Component({
  components: {
    Manual,
    URL,
    JSON
  }
})
export default class AddServer extends Vue {
  @Prop({ default: false, type: Boolean }) readonly value!: boolean;
  @ServerStore.Mutation(ADD_SERVER) mutationAddServer!: (
    server: IServer
  ) => void;

  mode: Mode = 'select';

  @Watch('showModal')
  onShowModal() {
    if (this.showModal) {
      this.mode = 'select';
    }
  }

  get showModal() {
    return this.value;
  }
  set showModal(val: boolean) {
    this.$emit('input', val);
  }

  get selectMode() {
    return this.mode === 'select';
  }

  get manualMode() {
    return this.mode === 'manual';
  }

  get URLMode() {
    return this.mode === 'URL';
  }

  get JSONMode() {
    return this.mode === 'json';
  }

  select(mode: Mode) {
    this.mode = mode;
  }

  back() {
    this.select('select');
  }

  add(server: IServer) {
    this.mutationAddServer(server);
    this.close();
    message.success(this.$i18n.t('views.servers.addSuccess') as string);
  }

  close() {
    this.$emit('input', false);
  }
}
</script>
<style lang="postcss" module>
.head {
  min-width: 448px;
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

.icon {
  width: 40px;
  height: 40px;
}

.server {
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  min-width: 120px;
  min-height: 120px;

  &:hover {
    background-color: var(--color-hover);
  }
}

.name {
  margin-top: 16px;
  color: var(--color-secondary);
}
</style>
