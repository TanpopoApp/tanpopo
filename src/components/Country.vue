<template>
  <svg role="img" width="24" height="18" :class="$style.icon">
    <use :xlink:href="getIconPath() + '#' + country"></use>
  </svg>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component
export default class Icon extends Vue {
  @Prop(String) private country!: string;

  getIconPath() {
    return require(`@/assets/country.svg`);
  }
}
</script>
<style lang="postcss" module>
.icon {
  margin-right: 8px;
}
</style>
