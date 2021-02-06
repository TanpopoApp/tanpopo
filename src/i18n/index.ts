import Vue from 'vue';
import VueI18n from 'vue-i18n';
import store from '@/store';
import { DEFAULT_LANG } from '@/utils/const';
import zh from './lang/zh-CN';
import en from './lang/en';

Vue.use(VueI18n);

export const internalLang = DEFAULT_LANG;

export const i18n = new VueI18n({
  locale: internalLang,
  fallbackLocale: internalLang,
  messages: {
    'zh-CN': {
      ...zh
    },
    en
  }
});

function setI18nLanguage(lang: string): string {
  i18n.locale = lang;
  document.documentElement.setAttribute('lang', lang);
  return lang;
}

(function() {
  const defaultLangName = store.getters['settings/language'] || internalLang;
  setI18nLanguage(defaultLangName);
})();
