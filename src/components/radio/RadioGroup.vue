<template>
  <div :class="$style.radioGroup">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { v4 as uuidv4 } from 'uuid';
export type TRadio = string | number;

@Component({
  provide() {
    return {
      radioGroup: this
    };
  }
})
export default class RadioGroup extends Vue {
  @Prop() readonly value!: TRadio;
  @Prop({ default: uuidv4() }) readonly name!: string;

  selectRadio(value: TRadio) {
    this.$emit('input', value);
  }
}
</script>
<style lang="postcss" module>
.radioGroup {
  display: block;
}
</style>
