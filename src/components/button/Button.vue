<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="isLink ? to : false"
    v-on="$listeners"
    :type="buttonType"
    :disabled="disabledState"
    :class="modeClass"
  >
    <Icon name="waiting" :className="$style.loading" v-if="loading" />
    <span :class="$style.text">
      <slot></slot>
    </span>
  </component>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import { RawLocation } from 'vue-router';
import { FormItem } from '@/components/form';

type ButtonMode = 'primary' | 'normal' | 'danger';

@Component
export default class Button extends Vue {
  @Prop({ default: 'button' }) readonly type!: string;
  @Prop({ default: 'primary' }) readonly mode!: ButtonMode;
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean;
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;
  @Prop({ default: '' }) readonly className!: string;
  @Prop() readonly to!: RawLocation;
  @Inject({ default: null }) readonly formItem!: FormItem | null;

  get isLink() {
    return !!this.to;
  }

  get modeClass() {
    if (this.disabledState) {
      return `${this.$style.button} ${this.className}`;
    } else {
      return `${this.$style.button} ${this.className} ${
        this.$style[this.mode]
      }`;
    }
  }
  get buttonType() {
    if (this.isLink) {
      return false;
    } else {
      return this.type;
    }
  }

  get disabledButton() {
    return this.disabled || this.loading;
  }

  get disabledState() {
    if (this.formItem) {
      return this.formItem.disabledItem || this.disabledButton;
    } else {
      return this.disabledButton;
    }
  }
}
</script>
<style lang="postcss" module>
@define-mixin button {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

@define-mixin main-button {
  @mixin button;
  color: var(--color-bg);
  background-image: linear-gradient(to bottom, #40a9ff, #1890ff 98%);

  &:hover {
    opacity: 0.8;
  }
}

@define-mixin normal-button {
  @mixin button;
  position: relative;
  color: var(--color-secondary);
  border: solid 1px var(--color-border);
  background-color: var(--color-bg);

  &:hover {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--color-hover);
    }
  }
}

@define-mixin disabled-button {
  @mixin button;
  color: var(--color-disabled);
  border: solid 1px var(--color-border);
  background-color: var(--color-hover);
  cursor: not-allowed;
}

.button {
  min-width: 128px;
  height: 32px;
  padding: 0 16px;

  &.primary {
    @mixin main-button;
  }

  &.normal {
    @mixin normal-button;
  }

  &.danger {
    @mixin button;
    color: var(--color-danger);
    border: 1px solid var(--color-danger);

    &:hover {
      background-color: rgba(245, 34, 45, 0.05);
    }
  }

  &[disabled],
  &:disabled {
    @mixin disabled-button;
    pointer-events: none;
  }

  .text {
    padding: 0 4px;
  }

  .loading {
    width: 16px;
    height: 16px;
    color: var(--color-main);
  }
}
</style>
