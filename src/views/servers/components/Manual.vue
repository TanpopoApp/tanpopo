<template>
  <div :class="$style.manual">
    <div :class="$style.form">
      <Form :model="form" :rules="rules" @on-validate="validate" @submit="save">
        <FormItem :label="$t('views.servers.name')" prop="name">
          <TanInput v-model="form.name"></TanInput>
        </FormItem>
        <FormItem :label="$t('views.servers.host')" prop="host">
          <TanInput v-model="form.host"></TanInput>
        </FormItem>
        <FormItem :label="$t('views.servers.port')" prop="port">
          <TanInput v-model.number="form.port"></TanInput>
        </FormItem>
        <FormItem :label="$t('views.servers.password')" prop="password">
          <TanInput v-model="form.password" type="password"></TanInput>
        </FormItem>
        <FormItem
          :label="`${$t('views.servers.sni')}(${$t('common.option')})`"
          prop="sni"
        >
          <TanInput v-model="form.sni"></TanInput>
        </FormItem>
        <FormItem>
          <div :class="$style.switch">
            <TanSwitch v-model="form.verify">
              {{ $t('views.servers.allowUnsafe') }}
            </TanSwitch>
            <TanSwitch v-model="form.verifyHostname">
              {{ $t('views.servers.verifyHostname') }}
            </TanSwitch>
            <TanSwitch v-model="form.fastOpen">
              {{ $t('views.servers.fastOpen') }}
            </TanSwitch>
          </div>
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
import { v4 as uuidv4 } from 'uuid';
import { IBasicServer, IServer } from '@/store/modules/server';

@Component
export default class Manual extends Vue {
  @Prop({ default: () => Object.create(null) }) readonly server!: IServer;

  form: IBasicServer = {
    uuid: '',
    name: '',
    host: '',
    port: 443,
    password: '',
    sni: '',
    verify: true,
    verifyHostname: true,
    fastOpen: false
  };

  validateResult: Dictionary<boolean> = {
    name: false,
    host: false,
    port: true,
    password: false
  };

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
    return {
      name: [required],
      host: [
        required,
        {
          pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$/,
          message: this.$i18n.t('validation.type'),
          trigger: 'blur'
        }
      ],
      port: [
        Object.assign({ type: 'number' }, required),
        {
          pattern: /^\d+$/,
          message: this.$i18n.t('validation.type'),
          trigger: 'blur'
        }
      ],
      password: [required]
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
      this.form = { ...this.form, ...(this.server as IBasicServer) };
    }
  }

  validate(valid: boolean, prop: string) {
    this.validateResult[prop] = valid;
  }

  save() {
    if (!this.form.uuid) {
      this.form.uuid = uuidv4();
    }
    this.$emit('submit', this.form);
  }

  cancel() {
    this.$emit('back');
  }
}
</script>
<style lang="postcss" module>
.manual {
  width: 640px;
  display: flex;
  justify-content: center;
}

.form {
  width: 420px;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 24px 0;
}

.switch {
  display: flex;
  justify-content: space-between;
}
</style>
