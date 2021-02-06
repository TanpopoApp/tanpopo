<template>
  <div :class="$style.url">
    <div :class="$style.form">
      <Form :model="form" :rules="rules" @on-validate="validate" @submit="save">
        <FormItem :label="$t('views.servers.name')" prop="name">
          <TanInput v-model="form.name"></TanInput>
        </FormItem>
        <FormItem :label="$t('views.servers.URL')" prop="URL">
          <TanInput v-model="form.URL"></TanInput>
        </FormItem>
        <div :class="$style.footer">
          <Button mode="normal" @click="cancel">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="!isValid">
            {{ $t('common.add') }}
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { parseTrojanURL } from '@/utils/url';

@Component
export default class URL extends Vue {
  @Prop({ default: false, type: Boolean }) readonly value!: boolean;

  form = {
    uuid: '',
    name: '',
    URL: ''
  };

  validateResult: Dictionary<boolean> = {
    name: false,
    URL: false
  };

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
      URL: [
        required,
        {
          pattern: /^trojan:\/\/(.*?)@(.*?):(\d+)(?:#?)(.*)/,
          message: this.$i18n.t('validation.type'),
          trigger: 'blur'
        }
      ]
    };
  }

  validate(valid: boolean, prop: string) {
    this.validateResult[prop] = valid;
  }

  save() {
    const serverInfo = parseTrojanURL(this.form.URL);
    const form = Object.assign(serverInfo, { name: this.form.name });
    this.$emit('submit', form);
  }

  cancel() {
    this.$emit('back');
  }
}
</script>
<style lang="postcss" module>
.url {
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
</style>
