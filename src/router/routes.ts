import { RouteConfig } from 'vue-router';
import Layout from '@/layout/Layout.vue';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import Servers from '@/views/servers/Servers.vue';
import Subscriptions from '@/views/subscriptions/Subscriptions.vue';
import Settings from '@/views/settings/Settings.vue';
import Logs from '@/views/logs/Logs.vue';
import About from '@/views/about/About.vue';

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard
      },
      {
        path: '/servers',
        name: 'servers',
        component: Servers
      },
      {
        path: '/subscriptions',
        name: 'subscriptions',
        component: Subscriptions
      },
      {
        path: '/settings',
        name: 'settings',
        component: Settings
      },
      {
        path: '/logs',
        name: 'logs',
        component: Logs
      },
      {
        path: '/about',
        name: 'about',
        component: About
      },
      {
        path: '',
        redirect: {
          name: 'dashboard'
        }
      }
    ]
  }
];

export default routes;
