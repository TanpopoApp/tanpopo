<template>
  <li
    @click.stop="selectOption"
    :class="{ [$style.option]: true, [$style.selected]: selectedOption }"
  >
    <slot>
      <span>{{ label }}</span>
    </slot>
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Watch } from 'vue-property-decorator';
import Select from './Select.vue';

@Component
export default class Option extends Vue {
  @Prop() readonly value!: string;
  @Prop({ default: '' }) readonly label!: string;
  @Inject() readonly select!: Select;

  @Watch('select.value', { immediate: true })
  onSelectValueChanged() {
    if (this.selectedOption) {
      this.select.setLabel(this.label);
    }
  }

  get selectedOption() {
    return this.select.value === this.value;
  }

  selectOption() {
    this.select.selectOption(this.value);
    this.select.setLabel(this.label);
    this.select.clickClose();
  }
}
</script>
<style lang="postcss" module>
.option {
  width: 100%;
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  color: var(--color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;

  &.selected {
    color: var(--color-primary);
  }

  &:hover {
    background-color: var(--color-hover);
  }
}
</style>
