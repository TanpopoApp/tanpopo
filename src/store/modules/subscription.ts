import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
import {
  ADD_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
  REMOVE_SUBSCRIPTION
} from '../mutations.type';
import { IServer } from './server';
import Store from 'electron-store';

export interface ISubscription {
  uuid: string;
  name: string;
  URL: string;
  updated?: string;
  nodes?: Array<IServer>;
}

export interface State {
  subscriptions: Array<ISubscription>;
}

const store = new Store();

@Module({
  namespaced: true
})
export default class Subscription extends VuexModule implements State {
  subscriptions: Array<ISubscription> =
    (store.get('subscriptions') as Array<ISubscription>) || [];

  @Mutation
  [ADD_SUBSCRIPTION](subscription: ISubscription) {
    this.subscriptions.push(subscription);
    store.set('subscriptions', this.subscriptions);
  }

  @Mutation
  [UPDATE_SUBSCRIPTION](subscription: ISubscription) {
    const index = this.subscriptions.findIndex(
      item => item.uuid === subscription.uuid
    );
    this.subscriptions.splice(index, 1, subscription);
    store.set('subscriptions', this.subscriptions);
  }

  @Mutation
  [REMOVE_SUBSCRIPTION](subscription: ISubscription) {
    const index = this.subscriptions.findIndex(
      item => item.uuid === subscription.uuid
    );
    this.subscriptions.splice(index, 1);
    store.set('subscriptions', this.subscriptions);
  }
}
