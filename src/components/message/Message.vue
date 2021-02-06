<template>
  <transition-group
    :class="$style.message"
    :style="styles"
    tag="div"
    name="message-fade"
    @after-leave="afterLeave"
  >
    <MessageItem
      v-for="notif in notifs"
      :key="notif.name"
      :icon="notif.icon"
      :name="notif.name"
      :content="notif.content"
      :duration="notif.duration"
    />
  </transition-group>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { v4 as uuidv4 } from 'uuid';
import zIndexManager from '@/utils/zIndexManager';
import MessageItem from './MessageItem.vue';
import { IMessageItem } from './types';

@Component({
  components: {
    MessageItem
  },
  provide() {
    return {
      message: this
    };
  }
})
export default class Message extends Vue {
  @Prop() readonly onDestory!: () => void;

  zIndex: number = zIndexManager.increase();
  notifs: Array<IMessageItem> = [];

  get styles() {
    const styles: Dictionary<number | string> = {};
    styles['z-index'] = this.zIndex;
    return styles;
  }

  add(notif: IMessageItem) {
    notif.name = notif.name || uuidv4();
    this.notifs.push(notif);
  }

  close(name: string) {
    const index = this.notifs.findIndex(notif => notif.name === name);
    if (index > -1) {
      this.notifs.splice(index, 1);
    }
  }

  afterLeave() {
    if (this.notifs.length === 0) {
      this.onDestory();
    }
  }
}
</script>
<style lang="postcss" module>
.message {
  position: fixed;
  top: 16px;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  pointer-events: none;
}
</style>
<style lang="postcss">
.message-fade-enter,
.message-fade-leave-active {
  opacity: 0;
  transform: translate(0, -100%);
}

.message-fade-leave-active {
  position: absolute;
  top: 0;
}
</style>
