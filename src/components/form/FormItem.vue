<template>
  <div :class="`${$style.item} ${this.className}`">
    <label :class="$style.label">
      <slot name="label">{{ label }}</slot>
    </label>
    <div :class="$style.content">
      <slot></slot>
      <transition name="fade">
        <div :class="$style.message" v-if="validateMessage">
          {{ validateMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import Form from './Form.vue';
import { Rule } from './types';
import AsyncValidator, { ErrorList } from 'async-validator';
// @ts-ignore
AsyncValidator.warning = () => {
  // ignore error
};

@Component({
  provide() {
    return {
      formItem: this
    };
  }
})
export default class FormItem extends Vue {
  @Prop() readonly prop!: string;
  @Prop() readonly label!: string;
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean;
  @Prop({ default: '' }) readonly className!: string;
  @Inject() readonly form!: Form;

  validateMessage = '';

  created() {
    this.form.formItem.push(this);
  }

  mounted() {
    this.$on('on-form-change', this.onFieldChange);
    this.$on('on-form-blur', this.onFieldBlur);
    this.$on('on-form-select', this.onFieldSelect);
  }

  get disabledItem() {
    return this.form.disabled || this.disabled;
  }

  get isValid() {
    return !this.validateMessage;
  }

  get rules(): Array<Rule> {
    return this.form.rules[this.prop] || [];
  }

  onFieldChange() {
    this.validate('change');
  }

  onFieldBlur() {
    this.validate('blur');
  }

  onFieldSelect() {
    this.validate('select');
  }

  getFilteredRule(trigger: string) {
    if (trigger) {
      return this.rules.filter(rule => rule.trigger.includes(trigger));
    } else {
      return this.rules;
    }
  }

  validate(trigger: string): Promise<ErrorList> {
    const rules = this.getFilteredRule(trigger);
    const descriptor = {
      [this.prop]: rules
    };
    const validator = new AsyncValidator(descriptor);
    return new Promise(resolve => {
      if (rules.length === 0) {
        resolve([]);
      } else {
        validator.validate(
          {
            [this.prop]: this.form.model[this.prop]
          },
          { firstFields: true },
          errors => {
            if (errors) {
              this.validateMessage = errors[0].message;
            } else {
              this.validateMessage = '';
            }
            this.form.emitValidate(this.isValid, this.prop);
            resolve(errors);
          }
        );
      }
    });
  }
}
</script>
<style lang="postcss" module>
.item {
  margin-bottom: 32px;
  text-align: left;
  position: relative;
  --height-content: 40px;

  .label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;

    &:empty {
      display: none;
    }
  }

  .content {
    height: var(--height-content);
  }

  .message {
    font-size: 12px;
    padding-top: 4px;
    color: var(--color-danger);
  }
}
</style>
<style lang="postcss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s linear;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
