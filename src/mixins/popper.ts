import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { createPopper } from '@popperjs/core/lib/popper-lite.js';
import { Instance, Options, Placement } from '@popperjs/core';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow.js';
import flip from '@popperjs/core/lib/modifiers/flip.js';
import hide from '@popperjs/core/lib/modifiers/hide.js';
import zIndexManager from '@/utils/zIndexManager';

@Component
export default class PopperMixin extends Vue {
  @Prop(Element) readonly reference!: Element;
  @Prop(HTMLElement) readonly popper!: HTMLElement;
  @Prop({ default: 'bottom' }) readonly placement!: Placement;
  @Prop({ default: true }) readonly appendToBody!: boolean;
  @Prop({ default: 100 }) delay!: number;

  timeout = 0;
  zIndex: number = zIndexManager.increase();

  currentReference: Element | null = null;
  currentPopper: HTMLElement | null = null;

  currentPlacement: Placement | null = null;
  visible = false;
  popperJS: Instance | null = null;
  popperElm: HTMLElement | null = null;

  get styles() {
    const styles: Dictionary<number | string> = {};
    if (this.popperElm) {
      styles['z-index'] = this.zIndex;
    }
    return styles;
  }

  @Watch('visible')
  onVisibleChanged(visible: boolean) {
    if (visible) {
      this.$nextTick(this.updatePopper);
    }
  }

  showPopper(refresh = false) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (refresh) {
      this.createPopper();
    }

    this.timeout = window.setTimeout(() => {
      this.visible = true;
    }, this.delay);
  }

  closePopper() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        this.visible = false;
      }, this.delay);
    }
  }

  createPopper() {
    if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.placement)) {
      return;
    }

    const popper = this.currentPopper || this.popper || this.$refs.popper;
    const reference =
      this.currentReference || this.reference || this.$refs.reference;
    this.currentPlacement = this.currentPlacement || this.placement;
    const options: Options = {
      modifiers: [preventOverflow, flip, hide],
      placement: this.currentPlacement,
      strategy: 'absolute',
      onFirstUpdate: () => {
        this.$nextTick(this.updatePopper);
      }
    };
    if (!popper || !reference) {
      return;
    }
    this.popperElm = popper;
    if (this.appendToBody) {
      document.body.appendChild(popper);
    }

    if (this.popperJS && this.popperJS.destroy) {
      this.popperJS.destroy();
    }
    this.popperJS = createPopper(reference, popper, options);
  }

  updatePopper() {
    this.popperJS ? this.popperJS.update() : this.createPopper();
  }

  doDestroy() {
    this?.popperJS?.destroy();
    this.popperJS = null;
  }

  beforeDestroy() {
    this.doDestroy();
    if (this.popperElm && this.popperElm.parentNode === document.body) {
      document.body.removeChild(this.popperElm);
    }
  }
}
