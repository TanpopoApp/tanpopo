<template>
  <b-modal v-model="showModal">
    <div class="modal-card" :class="$style.card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ headerText }}</p>
      </header>
      <section class="modal-card-body" :class="$style.add">
        <div :class="$style.nav">
          <button
            :class="buttonClass('manual')"
            @click="selectTab('manual')"
            v-show="showManual"
          >
            <b-icon icon="pencil" :class="$style.actionIcon"></b-icon>
          </button>
          <button
            :class="buttonClass('url')"
            v-show="addMode"
            @click="selectTab('url')"
          >
            <b-icon icon="link" :class="$style.actionIcon"></b-icon>
          </button>
          <button
            :class="buttonClass('advanced')"
            v-show="showAdvanced"
            @click="selectTab('advanced')"
          >
            <b-icon icon="code-json" :class="$style.actionIcon"></b-icon>
          </button>
          <button
            :class="buttonClass('qrcode')"
            v-show="showQRCode"
            @click="selectTab('qrcode')"
          >
            <b-icon icon="qrcode" :class="$style.actionIcon"></b-icon>
          </button>
        </div>
        <div :class="$style.addForm" v-show="manualMode">
          <b-field :label="$t('views.servers.name')" horizontal>
            <b-input v-model="form.name" required> </b-input>
          </b-field>
          <b-field :label="$t('views.servers.host')" horizontal>
            <b-input v-model="form.host" required> </b-input>
          </b-field>
          <b-field :label="$t('views.servers.port')" horizontal>
            <b-input v-model="form.port" pattern="\d+" required> </b-input>
          </b-field>
          <b-field :label="$t('views.servers.password')" horizontal>
            <b-input
              type="password"
              v-model="form.password"
              password-reveal
              required
            >
            </b-input>
          </b-field>
          <b-field
            :label="`${$t('views.servers.sni')}(${$t('common.option')})`"
            horizontal
          >
            <b-input v-model="form.sni"> </b-input>
          </b-field>
          <div :class="$style.options">
            <b-switch
              v-model="form.verify"
              type="is-success"
              :left-label="true"
              :class="$style.switch"
            >
              {{ $t('views.servers.allowUnsafe') }}
            </b-switch>
            <b-switch
              v-model="form.verifyHostname"
              type="is-success"
              :left-label="true"
              :class="$style.switch"
            >
              {{ $t('views.servers.verifyHostname') }}
            </b-switch>
            <b-switch
              v-model="form.fastOpen"
              type="is-success"
              :left-label="true"
              :class="$style.switch"
            >
              {{ $t('views.servers.fastOpen') }}
            </b-switch>
          </div>
        </div>
        <div :class="$style.addForm" v-show="urlMode">
          <b-field :label="$t('views.servers.URL')" horizontal>
            <b-input v-model="urlForm.URL" required> </b-input>
          </b-field>
          <b-field :label="$t('views.servers.name')" horizontal>
            <b-input v-model="urlForm.name"> </b-input>
          </b-field>
        </div>
        <div :class="$style.addForm" v-show="advancedMode">
          <b-field :label="$t('views.servers.name')" horizontal>
            <b-input v-model="advancedForm.name"> </b-input>
          </b-field>
          <b-field :label="$t('views.servers.json')" horizontal>
            <div ref="json" class="json"></div>
          </b-field>
        </div>
        <div :class="$style.codeForm" v-show="selectedTab === 'qrcode'">
          <img :src="qrcodeURL" width="164" height="164" alt="QR Code" />
        </div>
      </section>
      <footer class="modal-card-foot" :class="$style.foot">
        <button class="button is-primary" @click="submit">
          {{ buttonText }}
        </button>
      </footer>
    </div>
  </b-modal>
</template>

<script lang="ts">
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as types from '@/store/types';
import { IAdvancedServer, IServer } from '@/store/modules/server';
import { parseTrojanURL, DEFAULT_SOCKS_PORT } from '@/utils';
import { ISettings } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import Store from 'electron-store';
import { namespace } from 'vuex-class';

const store = new Store();
const ServerStore = namespace('server');

type Mode = 'add' | 'edit';

type Tab = 'manual' | 'url' | 'advanced' | 'qrcode';

const defaultForm = {
  uuid: '',
  name: '',
  password: '',
  host: '',
  port: '443',
  sni: '',
  verify: true,
  verifyHostname: true,
  fastOpen: false
};

const defaultURLForm = {
  URL: '',
  name: ''
};

const defaultAdvancedForm = {
  uuid: '',
  name: '',
  json: ''
};

@Component
export default class ServerModal extends Vue {
  @Prop() readonly value!: boolean;
  @Prop() readonly serverId!: string;
  @Prop(String) readonly mode!: Mode;
  @ServerStore.State servers!: Array<IServer>;
  @ServerStore.Mutation(types.ADD_SERVER) mutationAddServer!: (
    server: IServer
  ) => void;
  @ServerStore.Mutation(types.UPDATE_SERVER) mutationUpdateServer!: (
    server: IServer
  ) => void;
  form = Object.assign({}, defaultForm);
  urlForm = Object.assign({}, defaultURLForm);
  advancedForm = Object.assign({}, defaultAdvancedForm);
  cm: CodeMirror.Editor | null = null;
  qrcodeURL = '';

  selectedTab: Tab = 'manual';

  @Watch('value')
  onShowModal() {
    if (this.value) {
      if (this.addMode) {
        this.form = Object.assign({}, defaultForm);
        this.advancedForm = Object.assign({}, defaultAdvancedForm);
        this.urlForm = Object.assign({}, defaultURLForm);
        this.selectedTab = 'manual';
      } else {
        this.initForm();
      }
    } else {
      this.cm = null;
    }
  }

  @Watch('selectedTab')
  onSelectedTabChanged() {
    if (this.selectedTab === 'qrcode') {
      this.generateQRcode();
    } else if (this.selectedTab === 'advanced') {
      if (this.cm) {
        this.cm.refresh();
      } else {
        this.initCM();
      }
    }
  }

  get showModal() {
    return this.value;
  }
  set showModal(val: boolean) {
    this.$emit('input', val);
  }

  get addMode() {
    return this.mode === 'add';
  }

  get editMode() {
    return this.mode === 'edit';
  }

  get manualMode() {
    return this.selectedTab === 'manual';
  }

  get urlMode() {
    return this.selectedTab === 'url';
  }

  get advancedMode() {
    return this.selectedTab === 'advanced';
  }

  get showQRCode() {
    return this.editMode && !this.advancedMode;
  }

  get showManual() {
    return (!this.advancedMode && this.editMode) || this.addMode;
  }

  get showAdvanced() {
    return (this.advancedMode && this.editMode) || this.addMode;
  }

  get headerText() {
    if (this.addMode) {
      return this.$i18n.t('views.servers.addServer');
    } else {
      return this.$i18n.t('views.servers.editServer');
    }
  }

  get buttonText() {
    if (this.addMode) {
      return this.$i18n.t('common.add');
    } else {
      return this.$i18n.t('common.update');
    }
  }

  get isValidForm() {
    return (
      this.form.name && this.form.host && this.form.port && this.form.password
    );
  }

  initCM() {
    this.cm = CodeMirror(this.$refs.json as HTMLElement, {
      value: this.advancedForm.json,
      mode: {
        name: 'javascript',
        json: true,
        statementIndent: 2
      },
      theme: 'monokai',
      indentUnit: 2,
      lineNumbers: true
    });
    this.refreshCM();
  }

  refreshCM() {
    this.$nextTick(() => {
      this.cm?.refresh();
    });
  }

  initForm() {
    const selectedServer = this.servers.find(
      server => server.uuid === this.serverId
    );
    if (selectedServer) {
      if ((selectedServer as IAdvancedServer).json) {
        this.advancedForm = Object.assign(
          {},
          defaultAdvancedForm,
          selectedServer
        );
        this.selectedTab = 'advanced';
        this.$nextTick(() => {
          this.initCM();
        });
      } else {
        this.form = Object.assign({}, defaultForm, selectedServer);
        this.selectedTab = 'manual';
      }
    }
  }

  generateQRcode() {
    const url = `trojan://${this.form.password}@${this.form.host}:${this.form.port}#${this.form.name}`;
    QRCode.toDataURL(url).then(dataURL => {
      this.qrcodeURL = dataURL;
    });
  }

  selectTab(tab: Tab) {
    this.selectedTab = tab;
  }

  buttonClass(tab: Tab) {
    if (tab === this.selectedTab) {
      return `${this.$style.actionButton} ${this.$style.selected}`;
    } else {
      return `${this.$style.actionButton}`;
    }
  }

  submit() {
    if (this.addMode) {
      this.add();
    } else {
      this.update();
    }
  }

  showInputError() {
    this.$buefy.toast.open({
      message: this.$i18n.t('common.inputError') as string,
      type: 'is-warning',
      position: 'is-bottom-right'
    });
  }

  validateConfig(json: string) {
    try {
      const config = JSON.parse(json);
      if (
        !config.local_addr ||
        !config.local_port ||
        !config.remote_addr ||
        !config.remote_port ||
        !config.password
      ) {
        this.showInputError();
        return false;
      }
      const settings: ISettings = (store.get('settings') as ISettings) || {};
      const port = Number(settings.socksPort || DEFAULT_SOCKS_PORT);
      if (port !== config.local_port) {
        this.$buefy.toast.open({
          message: this.$i18n.t('views.servers.portNotMatch') as string,
          type: 'is-warning',
          position: 'is-bottom-right'
        });
      }
      return true;
    } catch (e) {
      this.showInputError();
      return false;
    }
  }

  update() {
    if (this.manualMode) {
      if (this.isValidForm) {
        this.mutationUpdateServer(Object.assign({}, this.form));
      } else {
        this.showInputError();
        return;
      }
    } else if (this.advancedMode) {
      const json = this.cm?.getValue();
      if (this.advancedForm.name && json) {
        this.advancedForm.json = json;
        if (this.validateConfig(json)) {
          this.mutationUpdateServer(Object.assign({}, this.advancedForm));
        } else {
          return;
        }
      } else {
        this.showInputError();
        return;
      }
    }
    this.showModal = false;
  }

  add() {
    if (this.urlMode) {
      if (this.urlForm.URL) {
        const serverInfo = parseTrojanURL(this.urlForm.URL);
        if (serverInfo) {
          Object.assign(this.form, serverInfo);
          if (this.urlForm.name) {
            this.form.name = this.urlForm.name;
          }
          this.urlForm = Object.assign({}, defaultURLForm);
          this.mutationAddServer(
            Object.assign(this.form, {
              uuid: uuidv4()
            })
          );
        } else {
          this.showInputError();
          return;
        }
      } else {
        this.showInputError();
        return;
      }
    } else if (this.manualMode) {
      if (this.isValidForm) {
        this.mutationAddServer(
          Object.assign(this.form, {
            uuid: uuidv4()
          })
        );
      } else {
        this.showInputError();
        return;
      }
    } else if (this.advancedMode) {
      const json = this.cm?.getValue();
      if (this.advancedForm.name && json) {
        this.advancedForm.json = json;
        if (this.validateConfig(json)) {
          this.mutationAddServer(
            Object.assign(this.advancedForm, {
              uuid: uuidv4()
            })
          );
        } else {
          return;
        }
      } else {
        this.showInputError();
        return;
      }
    }

    this.showModal = false;
    this.form = Object.assign({}, defaultForm);
  }
}
</script>
<style lang="postcss" module>
.card {
  width: 100%;
  overflow: auto;
  background-color: var(--color-white);
}
.add {
  width: 100%;
  min-height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav {
  display: flex;
  margin-bottom: 16px;
}
.action {
  &Icon {
    width: 48px;
    height: 48px;
  }

  &Button {
    margin: 0 8px;
    display: flex;
    align-items: center;
    align-items: center;
    border-radius: 8px;
    background: var(--color-bg);
  }
}
.selected {
  color: var(--color-normal);
}
.addForm {
  max-width: 600px;
  width: 100%;
}

.codeForm {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.options {
  display: flex;
  justify-content: flex-end;
}

.switch {
  margin: 8px 8px 8px 0;
  padding: 8px;
  border-radius: 8px;
  background: var(--color-bg);
}

.foot {
  display: flex;
  justify-content: center;
}
</style>
<style lang="postcss">
.json {
  position: relative;
  width: 480px;
  height: 300px;
}
</style>
