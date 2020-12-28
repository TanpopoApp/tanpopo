<template>
  <nav :class="$style.nav">
    <ul :class="$style.menu">
      <slot></slot>
    </ul>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Menu extends Vue {}
</script>
<style lang="postcss" module>
.nav {
  display: block;
}
.menu {
  display: block;
}
</style>
