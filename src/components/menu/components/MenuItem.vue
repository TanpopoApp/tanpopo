<template>
  <li :class="$style.item" role="menuitem">
    <router-link
      :to="{
        name
      }"
      :class="$style.link"
      :active-class="$style.active"
    >
      <slot></slot>
    </router-link>
  </li>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { RawLocation } from 'vue-router';

@Component
export default class MenuItem extends Vue {
  @Prop() readonly name!: RawLocation;
}
</script>
<style lang="postcss" module>
.item {
  width: 100%;
  height: 48px;
}
.link {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  padding: 0 16px;
  color: var(--color-secondary);

  &:hover {
    color: var(--color-secondary);
    background-color: var(--color-hover);
  }
}
.active {
  color: var(--color-main);
  background-color: var(--color-hover);
  &:hover {
    color: var(--color-main);
  }
}
</style>
