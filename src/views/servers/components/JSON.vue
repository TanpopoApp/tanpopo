<template>
  <div :class="$style.json">
    <div :class="$style.form">
      <Form
        :model="form"
        :rules="rules"
        @on-validate="validate"
        @submit="save"
        ref="jsonForm"
      >
        <FormItem :label="$t('views.servers.type')" prop="type">
          <Select v-model="form.type" :popperClass="$style.popper">
            <Option
              v-for="type in serverType"
              :value="type.value"
              :key="type.value"
              :label="type.label"
            >
            </Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('views.servers.name')" prop="name">
          <TanInput v-model="form.name"></TanInput>
        </FormItem>
        <FormItem
          :label="$t('views.servers.json')"
          prop="json"
          :className="$style.jsonItem"
        >
          <div ref="json" :class="$style.jsonCode"></div>
        </FormItem>
        <div :class="$style.footer">
          <Button mode="normal" @click="cancel">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="!isValid">
            {{ submitText }}
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { v4 as uuidv4 } from 'uuid';
import { IAdvancedServer, IServer } from '@/store/modules/server';
import { Form } from '@/components/form';
import message from '@/components/message';
import { TYPE_TROJAN, TYPE_SS } from '@/utils/const';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

const SettingsStore = namespace('settings');

@Component
export default class JSON extends Vue {
  @Prop({ default: () => Object.create(null) }) readonly server!: IServer;

  @SettingsStore.Getter('socksPort') socksPort!: number;

  form: IAdvancedServer = {
    uuid: '',
    type: TYPE_TROJAN,
    name: '',
    json: ''
  };

  cm: CodeMirror.Editor | null = null;

  validateResult: Dictionary<boolean> = {
    name: false,
    json: true
  };

  get serverType() {
    return [
      {
        value: TYPE_TROJAN,
        label: this.$i18n.t('views.servers.serverType.trojan')
      },
      {
        value: TYPE_SS,
        label: this.$i18n.t('views.servers.serverType.shadowsocks')
      }
    ];
  }

  get editMode() {
    return !!this.server.uuid;
  }

  get isValid() {
    return Object.values(this.validateResult).every(result => result);
  }

  get rules() {
    const required = {
      required: true,
      message: this.$i18n.t('validation.required'),
      trigger: ['change', 'blur']
    };
    const validateJSON = (rule: object, value: string, callback: Function) => {
      try {
        const config = window.JSON.parse(this.form.json);
        if (this.form.type === TYPE_TROJAN) {
          if (
            config.run_type &&
            config.local_addr &&
            typeof config.local_port === 'number' &&
            config.remote_addr &&
            typeof config.remote_port === 'number' &&
            Array.isArray(config.password)
          ) {
            callback();
          } else {
            callback(new Error(this.$i18n.t('validation.type') as string));
          }
        } else if (this.form.type === TYPE_SS) {
          if (
            config.server &&
            config.local_port &&
            typeof config.local_port === 'number' &&
            config.server_port &&
            typeof config.server_port === 'number'
          ) {
            callback();
          } else {
            callback(new Error(this.$i18n.t('validation.type') as string));
          }
        } else {
          callback();
        }
      } catch (e) {
        callback(new Error(this.$i18n.t('validation.type') as string));
      }
    };
    return {
      name: [required],
      json: { validator: validateJSON, trigger: 'blur' }
    };
  }

  get submitText() {
    if (this.editMode) {
      return this.$i18n.t('common.update');
    } else {
      return this.$i18n.t('common.add');
    }
  }

  mounted() {
    if (this.editMode) {
      this.form = { ...this.form, ...(this.server as IAdvancedServer) };
    }
    this.initCM();
  }

  initCM() {
    this.cm = CodeMirror(this.$refs.json as HTMLElement, {
      value: this.form.json,
      mode: {
        name: 'javascript',
        json: true,
        statementIndent: 2
      },
      theme: 'monokai',
      indentUnit: 2,
      lineNumbers: true
    });
    this.cm.on('blur', () => {
      this.form.json = this.cm?.getValue() as string;
      (this.$refs['jsonForm'] as Form).validate();
    });
  }

  validate(valid: boolean, prop: string) {
    this.validateResult[prop] = valid;
  }

  save() {
    if (!this.form.uuid) {
      this.form.uuid = uuidv4();
    }
    const config = window.JSON.parse(this.form.json);
    if (config.local_port !== this.socksPort) {
      message.warning(this.$i18n.t('views.servers.portNotMatch') as string);
    }
    this.$emit('submit', this.form);
  }

  cancel() {
    this.$emit('back');
  }
}
</script>
<style lang="postcss" module>
.json {
  width: 860px;
  display: flex;
  justify-content: center;
}

.popper {
  width: 640px;
}

.form {
  width: 640px;

  .jsonItem {
    --height-content: 304px;
  }

  .jsonCode {
    width: 100%;
    height: 304px;
  }
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 24px 0;
}
</style>
