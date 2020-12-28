<template>
  <div :class="$style.logs">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.logs.title') }}</h1>
      <b-button @click="clear">
        {{ $t('views.logs.clearLogs') }}
      </b-button>
    </div>
    <div :class="$style.body">
      <textarea
        class="textarea"
        :class="$style.bodyInner"
        :value="log"
        :readonly="true"
        ref="textarea"
      >
      </textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import path from 'path';
import fs from 'fs-extra';

const { app } = remote;
const appDataPath = app.getPath('userData');
const mainLog = path.resolve(appDataPath, 'logs/main.log');

@Component
export default class Logs extends Vue {
  log = '';
  watcher: fs.FSWatcher | undefined;

  mounted() {
    this.readLog(mainLog).then(() => {
      this.watcher = fs.watch(mainLog, () => {
        this.readLog(mainLog);
      });
    });
  }

  readLog(path: string) {
    return fs.ensureFile(path).then(async () => {
      this.log = await fs.readFile(path, 'utf8');
    });
  }

  clear() {
    fs.outputFile(mainLog, '');
  }

  beforeDestroy() {
    this.watcher?.close();
  }
}
</script>
<style lang="postcss" module>
.logs {
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
  position: relative;
  padding: 16px;
  flex: 1;
  background-color: var(--color-white);

  &Inner {
    position: absolute;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100% !important;
    top: 0;
    left: 0;
    white-space: pre-wrap;
    resize: none;
  }
}
</style>
