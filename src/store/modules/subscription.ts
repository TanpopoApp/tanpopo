import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import * as types from '../types';
import { IServer } from './server';
import { getSubscriptionNodes } from '@/utils';
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

async function fetchNodes(subscription: ISubscription) {
  const nodes = await getSubscriptionNodes(subscription.URL);
  if (nodes) {
    subscription.updated = new Date().toISOString();
    subscription.nodes = nodes;
  }
}
@Module({
  namespaced: true
})
export default class Subscription extends VuexModule implements State {
  subscriptions: Array<ISubscription> =
    (store.get('subscriptions') as Array<ISubscription>) || [];

  @Mutation
  [types.SAVE_SUBSCRIPTION]() {
    store.set('subscriptions', this.subscriptions);
  }

  @Action({ commit: types.SAVE_SUBSCRIPTION })
  async [types.ADD_SUBSCRIPTION](subscription: ISubscription) {
    this.subscriptions.push(subscription);
    await fetchNodes(subscription);
  }
  @Action({ commit: types.SAVE_SUBSCRIPTION })
  async [types.UPDATE_SUBSCRIPTION](subscription: ISubscription) {
    const index = this.subscriptions.findIndex(
      item => item.uuid === subscription.uuid
    );
    this.subscriptions.splice(index, 1, subscription);
    await fetchNodes(subscription);
  }
  @Mutation
  [types.REMOVE_SUBSCRIPTION](index: number) {
    this.subscriptions.splice(index, 1);
    store.set('subscriptions', this.subscriptions);
  }
}
