import Router from 'vue-router';
import Vue from 'vue';
import { i18n } from '@/i18n';

const DEFAULT_TITLE = i18n.t('common.title') as string;

export function loadTitle(title?: string) {
  Vue.nextTick(() => {
    if (title) {
      document.title = title + ' | ' + DEFAULT_TITLE;
    } else {
      document.title = DEFAULT_TITLE;
    }
  });
}

export const afterGuards = (router: Router) => {
  router.afterEach(to => {
    loadTitle(to.meta?.title);
  });
};
