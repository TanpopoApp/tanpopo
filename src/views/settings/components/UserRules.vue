<template>
  <Modal v-model="showModal" :ok-text="$t('common.save')" @on-ok="save">
    <div :class="$style.head">
      <p :class="$style.title">
        {{ $t('views.settings.userRules') }}
      </p>
      <button @click="closeModal" :class="$style.close">
        <Icon name="close" />
      </button>
    </div>
    <div :class="$style.rule">
      <div :class="$style.tips">
        <p>{{ $t('views.settings.ruleTips.title') }}</p>
        <p>{{ $t('views.settings.ruleTips.proxyExample') }}</p>
        <p>{{ $t('views.settings.ruleTips.directExample') }}</p>
      </div>
      <TanInput
        type="textarea"
        spellcheck="false"
        :class="$style.textarea"
        v-model="rules"
      />
    </div>
  </Modal>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';

@Component
export default class UserRules extends Vue {
  @Prop({ default: false, type: Boolean }) readonly value!: boolean;
  @Prop({ default: '' }) readonly userRules!: string;

  rules = '';

  @Watch('showModal')
  onShowModal() {
    if (this.showModal) {
      this.rules = this.userRules;
    }
  }

  get showModal() {
    return this.value;
  }
  set showModal(val: boolean) {
    this.$emit('input', val);
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    this.$emit('submit', this.rules);
  }
}
</script>
<style lang="postcss" module>
.head {
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

.rule {
  width: 560px;
  padding: 0 24px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tips {
  margin: 16px 0;
  width: 100%;
}

.textarea {
  min-height: 240px;
}
</style>
