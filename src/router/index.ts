import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';
import { afterGuards } from './guards';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
});

afterGuards(router);

export default router;
