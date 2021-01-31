<template>
  <div :class="$style.item">
    <Icon :name="icon" :className="$style.icon" />
    <p :class="$style.text">
      {{ content }}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator';
import Message from './Message.vue';

@Component
export default class MessageItem extends Vue {
  @Prop() readonly name!: string;
  @Prop() readonly icon!: string;
  @Prop() readonly content!: string;
  @Prop({ default: 3 }) readonly duration!: number;
  @Inject() readonly message!: Message;

  mounted() {
    if (this.duration) {
      setTimeout(() => {
        this.destroy();
      }, this.duration * 1000);
    }
  }

  destroy() {
    this.message.close(this.name);
  }
}
</script>
<style lang="postcss" module>
.item {
  display: flex;
  align-items: center;
  max-width: 768px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px 0 var(--color-border);
  background-color: var(--color-white);
  transition: all 0.3s ease-in-out;

  .icon {
    margin-top: 2px;
    width: 16px;
    height: 16px;
    flex: none;
  }

  .text {
    margin-left: 8px;
  }
}
</style>
