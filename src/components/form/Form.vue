<template>
  <form :class="$style.form" @submit.prevent="submit">
    <slot></slot>
  </form>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import FormItem from './FormItem.vue';
import { Rules } from './types';

@Component({
  provide() {
    return {
      form: this
    };
  }
})
export default class Form extends Vue {
  @Prop() readonly model!: Dictionary<string>;
  @Prop() readonly rules!: Rules;
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean;

  formItem: Array<FormItem> = [];

  emitValidate(valid: boolean, prop: string) {
    this.$emit('on-validate', valid, prop);
  }

  validate() {
    return Promise.all(this.formItem.map(item => item.validate(''))).then(
      errorsList => {
        const errors = errorsList.flat().filter(x => x);
        if (errors.length > 0) {
          return false;
        } else {
          return true;
        }
      }
    );
  }
  submit() {
    this.validate().then(valid => {
      if (valid) {
        this.$emit('submit');
      }
    });
  }
}
</script>
<style lang="postcss" module>
.form {
  display: block;
}
</style>
