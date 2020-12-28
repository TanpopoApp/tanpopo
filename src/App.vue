<template>
  <div id="app">
    <router-view />
  </div>
</template>
<style lang="postcss">
html,
body {
  height: 100%;
  font-family: 'Open Sans', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue',
    'Hiragino Sans GB', 'WenQuanYi Micro Hei', Arial, sans-serif;
  color: var(--color-main);
}

html {
  overflow-y: auto;
}

a {
  color: var(--color-main);
  text-decoration: none;

  &:hover {
    color: var(--color-main);
  }
}

#app {
  height: 100%;
}

button {
  padding: 0;
  outline: none;
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
}
</style>
