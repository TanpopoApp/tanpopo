import MessageVue from './Message.vue';
import Vue from 'vue';

const DEFAULT_DURATION = 3;

class Message {
  private instance: Vue | null = null;

  info(content: string, duration = DEFAULT_DURATION) {
    this.show('info', content, duration);
  }

  success(content: string, duration = DEFAULT_DURATION) {
    this.show('success', content, duration);
  }

  warning(content: string, duration = DEFAULT_DURATION) {
    this.show('warning', content, duration);
  }

  error(content: string, duration = DEFAULT_DURATION) {
    this.show('error', content, duration);
  }

  loading(content: string, duration = DEFAULT_DURATION) {
    this.show('loading', content, duration);
  }

  private getMessageInstance() {
    this.instance = this.instance || this.initMessageInstance();
    return this.instance;
  }

  private initMessageInstance() {
    const props = {
      onDestory: () => {
        this.destroy();
      }
    };

    const instance = new MessageVue({
      propsData: props
    });

    const component = instance.$mount();
    document.body.appendChild(component.$el);
    return instance;
  }

  private show(icon: string, content: string, duration: number) {
    const instance = this.getMessageInstance();

    // @ts-ignore
    instance.add({
      icon,
      content,
      duration
    });
  }

  private destroy() {
    this.instance?.$destroy();
    this.instance?.$el.remove();
    this.instance = null;
  }
}

export default new Message();
