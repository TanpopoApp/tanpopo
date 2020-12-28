<template>
  <div :class="$style.about">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.about.title') }}</h1>
    </div>
    <div :class="$style.body">
      <div :class="$style.bodyInner">
        <img
          src="@/assets/img/logo.png"
          width="48"
          height="48"
          alt="Tanpopo icon"
          :class="$style.logo"
        />
        <p>{{ $t('views.about.version') + $t('common.colon') + version }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { remote } from 'electron';

const { app } = remote;

@Component
export default class About extends Vue {
  version = app.getVersion();
}
</script>
<style lang="postcss" module>
.about {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.head {
  display: flex;
  justify-content: space-between;
  height: 48px;
}
.title {
  font-size: 22px;
  font-weight: 500;
}
.body {
  display: flex;
  justify-content: center;
  padding: 16px;
  flex: 1;
  background-color: var(--color-white);
}
.bodyInner {
  width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo {
  margin: 16px 0 40px 0;
}
</style>
