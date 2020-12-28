<template>
  <b-modal v-model="showModal">
    <div class="modal-card" :class="$style.card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          {{ headerText }}
        </p>
      </header>
      <section class="modal-card-body" :class="$style.add">
        <div :class="$style.addForm">
          <b-field :label="$t('views.subscriptions.URL')">
            <b-input v-model="form.URL" required> </b-input>
          </b-field>
          <b-field :label="$t('views.subscriptions.name')">
            <b-input v-model="form.name" required> </b-input>
          </b-field>
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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as types from '@/store/types';
import { ISubscription } from '@/store/modules/subscription';
import { v4 as uuidv4 } from 'uuid';
import { namespace } from 'vuex-class';
const SubscriptionStore = namespace('subscription');

type Mode = 'add' | 'edit';

const defaultForm = {
  uuid: '',
  name: '',
  URL: ''
};

@Component
export default class SubscriptionModal extends Vue {
  @Prop() readonly value!: boolean;
  @Prop() readonly subId!: string;
  @Prop(String) readonly mode!: Mode;
  @SubscriptionStore.State subscriptions!: Array<ISubscription>;
  @SubscriptionStore.Action(types.ADD_SUBSCRIPTION)
  actionAddSubscription!: (subscription: ISubscription) => void;
  @SubscriptionStore.Action(types.UPDATE_SUBSCRIPTION)
  actionUpdateSubscription!: (subscription: ISubscription) => void;

  form = Object.assign({}, defaultForm);

  @Watch('mode', { immediate: true })
  onModeChanged() {
    if (this.addMode) {
      this.form = Object.assign({}, defaultForm);
    } else {
      this.initForm();
    }
  }

  @Watch('subId')
  onServerIdChanged() {
    this.initForm();
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

  get headerText() {
    if (this.addMode) {
      return this.$i18n.t('views.subscriptions.addSubscription');
    } else {
      return this.$i18n.t('views.subscriptions.editSubscription');
    }
  }

  get buttonText() {
    if (this.addMode) {
      return this.$i18n.t('common.add');
    } else {
      return this.$i18n.t('common.update');
    }
  }

  initForm() {
    const selectedSub = this.subscriptions.find(sub => sub.uuid === this.subId);
    if (selectedSub) {
      this.form = Object.assign({}, selectedSub);
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

  update() {
    if (this.form.name && this.form.URL) {
      this.actionUpdateSubscription(Object.assign({}, this.form));
      this.showModal = false;
    } else {
      this.showInputError();
    }
  }

  add() {
    if (this.form.name && this.form.URL) {
      this.actionAddSubscription(
        Object.assign(this.form, {
          uuid: uuidv4()
        })
      );
      this.showModal = false;
      this.form = Object.assign({}, defaultForm);
    } else {
      this.showInputError();
    }
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
  min-height: 250px;
  display: flex;
  justify-content: center;
}
.addForm {
  max-width: 400px;
  width: 100%;
  & :global {
    .field {
      min-height: 96px;
      margin-bottom: 0;
    }
  }
}
.foot {
  display: flex;
  justify-content: center;
}
</style>
