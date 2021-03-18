import { ipcMain, nativeTheme } from 'electron';
import { SYNC_THEME } from '@/utils/const';
import store from './store';

class Theme {
  init() {
    ipcMain.on(SYNC_THEME, (event, theme: typeof nativeTheme.themeSource) => {
      this.selectTheme(theme);
    });
    this.selectTheme(store.theme as typeof nativeTheme.themeSource);
  }

  selectTheme(theme: typeof nativeTheme.themeSource) {
    switch (theme) {
      case 'dark': {
        nativeTheme.themeSource = 'dark';
        break;
      }
      case 'light': {
        nativeTheme.themeSource = 'light';
        break;
      }
      case 'system':
      default: {
        nativeTheme.themeSource = 'system';
        break;
      }
    }
  }
}

export default new Theme();
