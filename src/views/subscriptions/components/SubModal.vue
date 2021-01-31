<template>
  <Modal v-model="showModal">
    <div :class="$style.head">
      <p :class="$style.title">
        {{ $t('views.subscriptions.addSubscription') }}
      </p>
      <button @click="close" :class="$style.close">
        <Icon name="close" />
      </button>
    </div>
    <div :class="$style.body">
      <div :class="$style.url">
        <div :class="$style.form">
          <Form
            :model="form"
            :rules="rules"
            @on-validate="validate"
            @submit="save"
          >
            <FormItem :label="$t('views.subscriptions.name')" prop="name">
              <TanInput v-model="form.name"></TanInput>
            </FormItem>
            <FormItem :label="$t('views.subscriptions.URL')" prop="URL">
              <TanInput v-model="form.URL"></TanInput>
            </FormItem>
            <div :class="$style.footer">
              <Button mode="normal" @click="close">
                {{ $t('common.cancel') }}
              </Button>
              <Button type="submit" :disabled="!isValid" :loading="loading">
                {{ submitText }}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <span></span>
    </template>
  </Modal>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import { ISubscription } from '@/store/types';
import message from '@/components/message';
import { getSubscriptionNodes } from '@/utils/resolveSub';
import { v4 as uuidv4 } from 'uuid';
import { ADD_SUBSCRIPTION, UPDATE_SUBSCRIPTION } from '@/store';
import { namespace } from 'vuex-class';

const SubscriptionStore = namespace('subscription');

@Component
export default class SubModal extends Vue {
  @Prop({ default: false, type: Boolean }) readonly value!: boolean;
  @Prop({ default: () => Object.create(null) })
  readonly subInfo!: ISubscription;

  @SubscriptionStore.Mutation(ADD_SUBSCRIPTION)
  mutationAddSubscription!: (subscription: ISubscription) => void;
  @SubscriptionStore.Mutation(UPDATE_SUBSCRIPTION)
  mutationUpdateSubscription!: (subscription: ISubscription) => void;

  form = {
    uuid: '',
    name: '',
    URL: ''
  };

  loading = false;

  validateResult: Dictionary<boolean> = {
    name: this.editMode,
    URL: this.editMode
  };

  get showModal() {
    return this.value;
  }
  set showModal(value: boolean) {
    this.$emit('input', value);
  }

  get editMode() {
    return !!this.subInfo.uuid;
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
      URL: [
        required,
        {
          pattern: /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z+/=]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,
          message: this.$i18n.t('validation.type'),
          trigger: 'blur'
        }
      ]
    };
  }

  get submitText() {
    if (this.editMode) {
      return this.$i18n.t('common.update');
    } else {
      return this.$i18n.t('common.add');
    }
  }

  @Watch('showModal')
  onShowModal() {
    if (this.value) {
      this.loading = false;
      if (this.editMode) {
        this.form = { ...this.form, ...this.subInfo };
      } else {
        this.form = {
          uuid: '',
          name: '',
          URL: ''
        };
      }
    }
  }

  validate(valid: boolean, prop: string) {
    this.validateResult[prop] = valid;
  }

  close() {
    this.$emit('input', false);
  }

  async save() {
    this.loading = true;
    if (!this.form.uuid) {
      this.form.uuid = uuidv4();
    }
    const nodes = await getSubscriptionNodes(this.form.URL);
    this.loading = false;
    if (Array.isArray(nodes) && nodes.length > 0) {
      const subscription: ISubscription = {
        uuid: this.form.uuid ? this.form.uuid : uuidv4(),
        name: this.form.name,
        URL: this.form.URL,
        updated: new Date().toISOString(),
        nodes: nodes
      };
      if (this.editMode) {
        this.mutationUpdateSubscription(subscription);
        message.success(
          this.$i18n.t('views.subscriptions.updateSuccess') as string
        );
      } else {
        this.mutationAddSubscription(subscription);
        message.success(
          this.$i18n.t('views.subscriptions.addSuccess') as string
        );
      }

      this.close();
    } else {
      message.warning(this.$i18n.t('views.subscriptions.errorURL') as string);
    }
  }
}
</script>
<style lang="postcss" module>
.head {
  min-width: 448px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.close {
  display: flex;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: var(--color-hover);
  }
}

.body {
  margin: 16px;
  display: flex;
  align-items: center;
  overflow: auto;
}

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
