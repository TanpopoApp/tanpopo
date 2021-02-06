<template>
  <svg role="img" :class="iconClass">
    <use :xlink:href="iconName"></use>
  </svg>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component
export default class Icon extends Vue {
  @Prop() readonly name!: string;
  @Prop({ default: '' }) readonly className!: string;

  get iconName(): string {
    return `#icon-${this.name}`;
  }

  get iconClass(): string {
    return `${this.className} ${this.$style.icon}`;
  }
}
</script>
<style lang="postcss" module>
.icon {
  fill: currentColor;
  width: 24px;
  height: 24px;
}
</style>
