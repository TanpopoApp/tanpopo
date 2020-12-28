<template>
  <div :class="$style.sidebar">
    <div :class="$style.logo">
      <img
        src="@/assets/img/logo.png"
        width="48"
        height="48"
        alt="trojan icon"
      />
    </div>
    <Menu>
      <MenuItem name="dashboard">
        {{ $t('layout.sidebar.dashboard') }}
      </MenuItem>
      <MenuItem name="servers">
        {{ $t('layout.sidebar.servers') }}
      </MenuItem>
      <MenuItem name="subscriptions">
        {{ $t('layout.sidebar.subscriptions') }}
      </MenuItem>
      <MenuItem name="settings">
        {{ $t('layout.sidebar.settings') }}
      </MenuItem>
      <MenuItem name="logs">
        {{ $t('layout.sidebar.logs') }}
      </MenuItem>
      <MenuItem name="about">
        {{ $t('layout.sidebar.about') }}
      </MenuItem>
    </Menu>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Sidebar extends Vue {}
</script>
<style lang="postcss" module>
.sidebar {
  width: 200px;
  flex: none;
  border-right: 1px solid var(--color-border);
}
.logo {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border);
}
</style>
