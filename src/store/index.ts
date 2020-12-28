import Vue from 'vue';
import Vuex from 'vuex';
import server, { State as ServerState } from './modules/server';
import subscription, {
  State as SubscriptionState
} from './modules/subscription';

Vue.use(Vuex);

export interface State {
  server: ServerState;
  subscription: SubscriptionState;
}

export default new Vuex.Store<State>({
  modules: {
    server,
    subscription
  }
});
