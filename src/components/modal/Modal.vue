<template>
  <transition name="mask" @after-leave="afterLeave" appear>
    <div :class="$style.modal" :style="styles" v-if="showModal">
      <div :class="`${$style.inner} modal-inner`">
        <div :class="$style.instance" v-if="instance">
          <Icon :name="icon" v-if="icon" :class="$style.icon" />
          <div :class="$style.body">
            <p :class="$style.title">
              {{ title }}
            </p>
            <p :class="$style.content">
              {{ content }}
            </p>
          </div>
        </div>
        <div :class="$style.modalBody" v-else>
          <slot></slot>
        </div>

        <slot name="footer">
          <div :class="$style.footer">
            <Button :className="$style.button" @click="clickOK" v-if="instance">
              {{ $t('common.ok') }}
            </Button>
            <template v-else>
              <Button
                :className="$style.button"
                @click="closeModal"
                mode="normal"
              >
                {{ $t('common.cancel') }}
              </Button>
              <Button :className="$style.button" @click="clickOK" :mode="type">
                {{ okText || $t('common.ok') }}
              </Button>
            </template>
          </div>
        </slot>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import zIndexManager from '@/utils/zIndexManager';

type ModalActionType = 'primary' | 'danger';

@Component
export default class Modal extends Vue {
  @Prop() readonly icon!: string;
  @Prop() readonly title!: string;
  @Prop() readonly content!: string;
  @Prop() readonly okText!: string;
  @Prop({ default: 'primary' }) readonly type!: ModalActionType;
  @Prop({ default: false, type: Boolean }) readonly value!: boolean;
  @Prop({ default: false, type: Boolean }) readonly instance!: boolean;
  @Prop() readonly onDestory!: () => void;
  zIndex: number = zIndexManager.increase();

  instanceOpen = true;

  @Watch('showModal')
  onShowModal() {
    if (this.showModal) {
      document.addEventListener('keydown', this.escClose);
    } else {
      document.removeEventListener('keydown', this.escClose);
    }
  }

  get styles() {
    const styles: Dictionary<number | string> = {};
    styles['z-index'] = this.zIndex;
    return styles;
  }

  get showModal() {
    if (this.instance) {
      return this.instanceOpen;
    } else {
      return this.value;
    }
  }

  closeModal() {
    if (this.instance) {
      this.instanceOpen = false;
    } else {
      this.$emit('input', false);
    }
  }

  escClose(event: KeyboardEvent) {
    if (event.key === 'Escape' && !this.instance) {
      this.closeModal();
    }
  }

  clickOK() {
    this.$emit('on-ok');
    this.closeModal();
  }

  afterLeave() {
    if (this.instance) {
      this.onDestory();
    }
  }
}
</script>
<style lang="postcss" module>
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);

  .inner {
    max-height: 100%;
    min-width: 388px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    background-color: var(--color-bg);
  }

  &Body {
    min-height: 104px;
    display: flex;
    flex-direction: column;
  }

  .instance {
    display: flex;
    padding: 32px;

    .body {
      margin-left: 16px;
    }

    .icon {
      flex: none;
    }

    .title {
      font-size: 16px;
      font-weight: 600;
    }

    .content {
      margin-top: 8px;
      color: var(--color-secondary);
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    box-shadow: inset 0 1px 0 0 rgba(0, 0, 0, 0.1);
    padding: 16px;
  }

  .button {
    min-width: auto;
    margin-left: 16px;
  }
}
</style>
<style lang="postcss">
.mask-enter-active {
  .modal-inner {
    animation: modal-in 0.3s;
  }
}

.mask-leave-active {
  .modal-inner {
    animation: modal-out 0.3s;
  }
}

@keyframes modal-in {
  0% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes modal-out {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.9);
  }
}

.mask-enter-active {
  animation: mask-in 0.3s;
}

.mask-leave-active {
  animation: mask-out 0.3s;
}

@keyframes mask-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes mask-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
