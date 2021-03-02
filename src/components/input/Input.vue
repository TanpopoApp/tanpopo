<template>
  <div
    :class="{ [$style.input]: true, [$style.disabled]: disabledState }"
    @mouseenter="inputHover = true"
    @mouseleave="inputHover = false"
  >
    <div :class="$style.prefix" v-if="!istextArea">
      <slot name="prefix"></slot>
    </div>
    <textarea
      v-if="istextArea"
      ref="input"
      :rows="rows"
      :class="{
        [$style.inner]: true,
        [$style.textarea]: true,
        [$style.hover]: inputHover,
        [$style.error]: inValidState
      }"
      :readonly="readonly"
      v-model="currentValue"
      @input="emitInput"
      @blur="emitBlur"
      @keyup.esc="emitEsc"
      @keyup.enter="emitEnter"
      :disabled="disabledState"
      :placeholder="placeholder"
      :required="required"
    ></textarea>
    <input
      v-else
      ref="input"
      :type="inputType"
      :autocomplete="autocomplete"
      :class="{
        [$style.inner]: true,
        [$style.inputText]: true,
        [$style.hover]: inputHover,
        [$style.error]: inValidState
      }"
      :readonly="readonly"
      v-model="currentValue"
      @input="emitInput"
      @blur="emitBlur"
      @keyup.esc="emitEsc"
      @keyup.enter="emitEnter"
      :disabled="disabledState"
      :placeholder="placeholder"
      :required="required"
    />

    <div :class="$style.suffix" v-if="!istextArea">
      <slot name="suffix"></slot>
      <Icon
        name="reset"
        :className="`${$style.icon} ${$style.clearIcon}`"
        @click.native.stop="clearInput"
        v-if="showClearButton"
      />
      <Icon
        :name="eyeIcon"
        :className="`${$style.icon} ${$style.eyeIcon}`"
        @click.native.stop="togglePasswordInput"
        v-if="showEyeButton"
      />
      <Icon
        name="waiting"
        :className="`${$style.icon} ${$style.loadingIcon}`"
        v-if="loading"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator';
import { FormItem } from '@/components/form';

@Component
export default class Input extends Vue {
  @Prop({ default: '' }) readonly value!: string;
  @Prop({ default: 'text', type: String }) readonly type!: string;
  @Prop({ default: 'no', type: String }) readonly autocomplete!: string;
  @Prop({ default: 2 }) readonly rows!: number;
  @Prop({ default: false, type: Boolean }) readonly readonly!: boolean;
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean;
  @Prop({ default: false, type: Boolean }) readonly required!: boolean;
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;
  @Prop({ default: false, type: Boolean }) readonly clearable!: boolean;
  @Prop({ default: false, type: Boolean }) readonly invalid!: boolean;
  @Prop({ default: false }) readonly placeholder!: string;

  @Inject({ default: null }) readonly formItem!: FormItem | null;

  currentValue = this.value;
  inputHover = false;

  passwordInputType = 'password';

  @Watch('value')
  onValueChanged() {
    this.currentValue = this.value;
    this.$emit('on-change', this.currentValue);
    this.emitFormItem('on-form-change');
  }

  get inputType() {
    if (this.isPasswordType) {
      return this.passwordInputType;
    } else {
      return this.type;
    }
  }
  get showClearButton() {
    return this.clearable && !this.disabled && !!this.currentValue;
  }

  get showEyeButton() {
    return this.isPasswordType;
  }

  get isPasswordType() {
    return this.type === 'password';
  }

  get eyeIcon() {
    if (this.passwordInputType === 'password') {
      return 'eye';
    } else {
      return 'eye-closed';
    }
  }

  get inValidState() {
    if (this.formItem) {
      return !this.formItem.isValid;
    } else {
      return this.invalid;
    }
  }

  get disabledState() {
    if (this.formItem) {
      return this.formItem.disabledItem;
    } else {
      return this.disabled;
    }
  }

  get istextArea() {
    return this.type === 'textarea';
  }

  togglePasswordInput() {
    if (this.passwordInputType === 'password') {
      this.passwordInputType = 'text';
    } else {
      this.passwordInputType = 'password';
    }
  }

  clearInput() {
    this.currentValue = '';
    this.emitClear();
    this.$nextTick(() => {
      this.focus();
    });
  }

  focus() {
    (this.$refs['input'] as HTMLInputElement).focus();
  }

  emitClear() {
    this.emitInput();
    this.$emit('on-clear', this.currentValue);
  }

  emitInput() {
    this.$emit('input', this.currentValue);
    this.$emit('on-input', this.currentValue);
  }

  emitEsc() {
    this.$emit('on-esc');
  }
  emitEnter() {
    this.$emit('on-enter');
  }
  emitBlur() {
    this.$emit('on-blur');
    this.emitFormItem('on-form-blur');
  }

  emitFormItem(event: string) {
    if (this.formItem) {
      this.formItem.$emit(event);
    }
  }
}
</script>
<style lang="postcss" module>
.input {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: stretch;

  &Text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .icon {
    position: absolute;
    width: 16px;
    height: 16px;
    color: var(--color-tertiary);
    background-color: var(--color-white);
  }

  .disabled {
    .icon {
      background-color: transparent;
    }
  }

  .clearIcon {
    cursor: pointer;
    visibility: hidden;
  }

  .eyeIcon {
    cursor: pointer;
  }

  .loadingIcon {
    top: 0;
    left: 0;
  }

  &:hover {
    .clearIconn {
      visibility: visible;
    }
  }

  .prefix,
  .suffix {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    transform: translateY(-50%);

    &:empty {
      visibility: hidden;
    }
  }

  .prefix {
    left: 8px;
  }

  .suffix {
    right: 8px;
  }

  .inner {
    width: 100%;
    border-radius: 4px;
    padding: 5px 8px;
    line-height: 20px;
    border: 1px solid var(--color-border);

    &:read-only {
      user-select: none;
      cursor: pointer;
    }

    &:hover,
    &.hover,
    &:focus {
      border: 1px solid var(--color-primary);
      outline: none;
    }

    &.error {
      border: 1px solid var(--color-danger);
    }

    &:disabled {
      cursor: not-allowed;
      color: var(--color-disabled);
      background-color: var(--color-hover);

      &:hover,
      &.hover,
      &:focus {
        border: 1px solid var(--color-border);
      }
    }
  }
}

.textarea {
  position: absolute;
  width: 100%;
  height: 100%;
  resize: none;
  color: var(--color-main);
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;

  &:read-only {
    cursor: auto;
  }
}
</style>
