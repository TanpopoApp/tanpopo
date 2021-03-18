<template>
  <div :class="$style.select" v-click-outside="clickClose">
    <div
      ref="reference"
      @click="handleClick"
      :class="{ [$style.rel]: true, [$style.disabled]: disabledState }"
    >
      <slot name="select" v-bind="{ currentLabel, visible }">
        <TanInput
          v-model="currentLabel"
          :class="$style.input"
          :readonly="!filterable"
          :disabled="disabledState"
          :loading="loading"
          :placeholder="placeholder"
          :clearable="clearable"
          @on-input="querySelect"
          @on-clear="clearSelect"
        >
          <template v-slot:suffix>
            <Icon
              name="caret-down"
              :class="{
                [$style.icon]: true,
                [$style.disabled]: disabledState,
                [$style.show]: visible
              }"
            />
          </template>
        </TanInput>
      </slot>
    </div>
    <transition name="fade">
      <div
        :class="$style.popper"
        :style="styles"
        ref="popper"
        v-show="visible && !disabledState"
      >
        <ul :class="[$style.option, popperClass]">
          <slot>
            <Option
              v-for="item in optionData"
              :value="item.value"
              :key="item.value"
              :label="item.label"
            />
          </slot>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Inject, Watch } from 'vue-property-decorator';
// @ts-ignore
import { directive as clickOutside } from 'v-click-outside-x';
import Option from './Option.vue';
import { FormItem } from '@/components/form';
import PopperMixin from '@/mixins/popper';
import { OptionItem } from '@/components/select';

@Component({
  directives: {
    clickOutside
  },
  components: {
    Option
  },
  provide() {
    return {
      select: this
    };
  }
})
export default class Select extends Mixins(PopperMixin) {
  @Prop() readonly value!: string;
  @Prop({ default: false }) readonly disabled!: boolean;
  @Prop({ default: false, type: Boolean }) readonly clearable!: boolean;
  @Prop({ default: false, type: Boolean }) readonly filterable!: boolean;
  @Prop({ default: '' }) readonly placeholder!: string;
  @Prop({ default: false, type: Boolean }) readonly lazy!: boolean;
  @Prop() readonly lazyLoad!: () => Promise<Array<OptionItem> | void>;
  @Prop({ default: '' }) readonly popperClass!: string;

  @Inject({ default: null }) readonly formItem!: FormItem | null;

  selectedLabel = '';
  currentLabel = '';

  loading = false;
  lazyLoaded = false;

  lazyData: Array<OptionItem> = [];

  mounted() {
    if (this.value) {
      this.loadSelect();
    }
  }

  @Watch('selectedLabel')
  onSelectLabelChanged() {
    this.currentLabel = this.selectedLabel;
    this.emitFormItem('on-form-select');
  }

  setLabel(label: string) {
    this.selectedLabel = label;
  }

  get disabledState() {
    if (this.formItem) {
      return this.formItem.disabledItem;
    } else {
      return this.disabled;
    }
  }

  get optionData() {
    if (this.filterable) {
      return this.lazyData.filter(option =>
        option.label.toLowerCase().includes(this.currentLabel.toLowerCase())
      );
    } else {
      return this.lazyData;
    }
  }

  querySelect() {
    if (this.filterable) {
      this.$emit('on-query-change', this.currentLabel);
      if (!this.visible) {
        this.showPopper();
      }
    }
  }

  clearSelect() {
    this.$emit('input', '');
    this.selectedLabel = '';
  }

  selectOption(value: string) {
    this.$emit('input', value);
    this.$emit('on-select', value);
  }

  clickClose() {
    if (this.visible) {
      this.emitFormItem('on-form-select');
      this.closePopper();
    }

    if (this.filterable) {
      this.currentLabel = this.selectedLabel;
    }
  }

  loadSelect() {
    if (this.lazy && !this.lazyLoaded) {
      this.loading = true;
      return this.lazyLoad()
        .then(res => {
          if (res) {
            this.lazyData = res;
            this.lazyLoaded = true;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    } else {
      return Promise.resolve();
    }
  }

  handleClick() {
    if (!this.disabledState) {
      if (this.visible) {
        this.closePopper();
      } else {
        this.loadSelect();
        this.showPopper();
      }
    }
  }

  emitFormItem(event: string) {
    if (this.formItem) {
      this.formItem.$emit(event);
    }
  }
}
</script>
<style lang="postcss" module>
.select {
  position: relative;
  height: 100%;

  .rel {
    position: relative;
    cursor: pointer;
    height: 100%;

    &.disabled {
      cursor: not-allowed;
    }
  }

  .icon {
    position: absolute;
    width: 16px;
    height: 16px;
    color: var(--color-tertiary);
    background-color: var(--color-bg);
    transition: transform 0.3s ease-in-out;

    &.disabled {
      background-color: transparent;
      cursor: not-allowed;
    }

    &.show {
      transform: rotate(180deg);
    }
  }

  .input {
    .input-inner {
      padding-right: 32px;
    }
  }
}

.popper[data-popper-reference-hidden] {
  visibility: hidden;
  pointer-events: none;
}
.option {
  list-style: none;
  max-height: 432px;
  width: 224px;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 var(--color-border);
  background-color: var(--color-bg);
  overflow: auto;
}
</style>
