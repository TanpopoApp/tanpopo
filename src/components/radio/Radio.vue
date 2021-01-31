<template>
  <button :class="$style.radio" @click="selectRadio">
    <input
      type="radio"
      :checked="checked"
      :name="groupName"
      :disabled="disabled"
      :class="$style.button"
    />
    <div :class="$style.text">
      <slot></slot>
    </div>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import RadioGroup, { TRadio } from './RadioGroup.vue';

@Component
export default class Radio extends Vue {
  @Prop() readonly value!: TRadio;
  @Inject() readonly radioGroup!: RadioGroup;
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean;

  get checked() {
    return this.radioGroup.value === this.value;
  }

  get groupName() {
    return this.radioGroup.name;
  }

  selectRadio() {
    this.radioGroup.selectRadio(this.value);
  }
}
</script>
<style lang="postcss" module>
.radio {
  display: flex;
  align-items: center;

  .button {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: solid 1px var(--color-border);
    cursor: pointer;

    &:checked {
      border: solid 1px var(--color-primary);
      background: transparent;

      &::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0);
        background-color: var(--color-primary);
      }
    }

    &:disabled {
      cursor: not-allowed;
      background-color: var(--color-hover);

      &:checked {
        border: solid 1px var(--color-border);

        &::after {
          background-color: var(--color-disabled);
        }
      }
    }
  }

  .text {
    margin-left: 8px;
    display: flex;
    align-items: center;

    &:empty {
      display: none;
    }
  }
}
</style>
