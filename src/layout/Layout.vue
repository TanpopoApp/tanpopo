<template>
  <div :class="$style.inner">
    <Sidebar />
    <div :class="$style.container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Sidebar from './Sidebar.vue';

@Component({
  components: {
    Sidebar
  }
})
export default class Layout extends Vue {}
</script>
<style lang="postcss" module>
.inner {
  display: flex;
  height: 100%;
}
.container {
  width: 100%;
  padding: 16px;
  background-color: var(--color-body-bg);
}
</style>
