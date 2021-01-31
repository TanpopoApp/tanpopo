import Vue from 'vue';
import Vuex from 'vuex';
import server, { State as ServerState } from './modules/server';
import subscription, {
  State as SubscriptionState
} from './modules/subscription';
import settings, { State as SettingsState } from './modules/settings';

Vue.use(Vuex);

export interface State {
  server: ServerState;
  subscription: SubscriptionState;
  settings: SettingsState;
}

export default new Vuex.Store<State>({
  modules: {
    server,
    subscription,
    settings
  }
});

export * from './mutations.type';
