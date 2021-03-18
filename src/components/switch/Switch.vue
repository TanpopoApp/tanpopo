<template>
  <button
    type="button"
    @click="toggle"
    :class="$style.switch"
    :disabled="disabled"
  >
    <span :class="switchClass"></span>
    <span :class="$style.text">
      <slot></slot>
    </span>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
type TSwitch = string | number | boolean;

@Component
export default class TanSwitch extends Vue {
  @Prop() readonly value!: TSwitch;
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean;
  get checked() {
    return this.value === true;
  }

  toggle() {
    this.$emit('input', !this.checked);
  }
  get switchClass() {
    const style = {
      [this.$style.button]: true
    };
    if (this.checked) {
      style[this.$style.checked] = true;
    }
    return style;
  }
}
</script>
<style lang="postcss" module>
.switch {
  display: inline-flex;
  align-items: center;

  &[disabled],
  &:disabled {
    cursor: not-allowed;
    .button {
      background-color: var(--color-switch-disabled);

      &.checked {
        background-color: var(--color-primary-disabled);
      }
    }
  }

  .button {
    position: relative;
    display: flex;
    width: 40px;
    height: 20px;
    border-radius: 10px;
    background-color: var(--color-border);
    transition: background-color 0.3s ease-in-out;

    &::after {
      position: absolute;
      content: '';
      top: 50%;
      left: 2px;
      transform: translate3d(0, -50%, 0);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: var(--color-bg);
      transition: left 0.3s ease-in-out;
    }

    &.checked {
      background-color: var(--color-primary);

      &::after {
        left: 22px;
      }
    }
  }

  .text {
    margin-left: 8px;

    &:empty {
      display: none;
    }
  }
}
</style>
