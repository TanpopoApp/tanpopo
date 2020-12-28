import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Store from 'electron-store';
import zh from './lang/zh-CN';
import en from './lang/en';

Vue.use(VueI18n);

const store = new Store();

export const internalLang = 'en';

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
  store.set('language', lang);
  return lang;
}

(function() {
  const defaultLangName = (store.get('language') as string) || internalLang;
  setI18nLanguage(defaultLangName);
})();
