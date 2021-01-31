import ModalVue from './Modal.vue';
import { i18n } from '@/i18n';
import Vue from 'vue';

class Modal {
  private instance: Vue | null = null;

  info(title: string, content: string, onOK?: Function) {
    this.show('info', title, content, onOK);
  }

  success(title: string, content: string, onOK?: Function) {
    this.show('success', title, content, onOK);
  }

  warning(title: string, content: string, onOK?: Function) {
    this.show('warning', title, content, onOK);
  }

  error(title: string, content: string, onOK?: Function) {
    this.show('error', title, content, onOK);
  }

  loading(title: string, content: string, onOK?: Function) {
    this.show('loading', title, content, onOK);
  }

  private getMessageInstance() {
    this.instance = this.instance || this.initModalInstance();
    return this.instance;
  }

  private initModalInstance() {
    const props = {
      onDestory: () => {
        this.destroy();
      },
      instance: true
    };

    const instance = new ModalVue({
      i18n,
      propsData: props
    });

    const component = instance.$mount();
    document.body.appendChild(component.$el);
    return instance;
  }

  private show(icon: string, title: string, content: string, onOK?: Function) {
    const instance = this.getMessageInstance();
    // @ts-ignore
    instance.icon = icon;
    // @ts-ignore
    instance.title = title;
    // @ts-ignore
    instance.content = content;
    // @ts-ignore
    instance.onOK = onOK;
  }

  private destroy() {
    this.instance?.$destroy();
    this.instance?.$el.remove();
    this.instance = null;
  }
}

export default new Modal();
