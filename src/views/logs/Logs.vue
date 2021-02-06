<template>
  <div :class="$style.logs">
    <div :class="$style.head">
      <h1 :class="$style.title">{{ $t('views.logs.title') }}</h1>
      <Button @click="clear" mode="normal">
        {{ $t('views.logs.clearLogs') }}
      </Button>
    </div>
    <div :class="$style.body">
      <TanInput
        :class="$style.textarea"
        :value="log"
        :readonly="true"
        type="textarea"
        :rows="false"
      />
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
  font-size: 18px;
  font-weight: 600;
  line-height: 32px;
}
.body {
  position: relative;
  padding: 16px;
  flex: 1;
  background-color: var(--color-white);
}

.textarea {
  display: block;
}
</style>
