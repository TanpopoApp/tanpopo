import { app, Menu, MenuItemConstructorOptions, Tray } from 'electron';
import client from '@/main/app';
import trojan from './trojan';
import { appWindow } from './window';
import { trayIcon, isMac, isWin, isLinux } from '@/utils';
import { ISettings } from '@/types';
import Store from 'electron-store';
import zh from '@/i18n/lang/zh-CN';
import en from '@/i18n/lang/en';
const store = new Store();

class TrayMenu {
  tray: Tray | null = null;
  menu: Menu | null = null;

  initMenu() {
    this.tray = new Tray(trayIcon);
    if (isMac) {
      app.dock.hide();
    }
    if (isWin) {
      this.tray.on('click', () => {
        this.show();
      });
      this.tray.on('right-click', () => {
        this.updateMenu();
      });
    } else {
      this.tray.on('click', () => {
        this.updateMenu();
      });
    }
  }

  getProxyMode() {
    const settings = store.get('settings') as ISettings;
    return settings.proxyMode || 'local';
  }

  async setProxyMode(mode: string) {
    const settings = (store.get('settings') || {}) as ISettings;
    settings.proxyMode = mode;
    store.set('settings', settings);
    if (store.get('enableProxy')) {
      await trojan.start();
    }
  }

  show() {
    appWindow.createWindow();
  }

  updateMenu() {
    const menuTemplate = [
      { label: this.getLang()!.tray.showPanel, click: this.show },
      { type: 'separator' },
      {
        label: `${this.getLang()!.common.title}${this.getLang()!.common.colon}${
          store.get('enableProxy')
            ? this.getLang()!.common.on
            : this.getLang()!.common.off
        }`,
        enabled: false
      },
      {
        label: `${
          store.get('enableProxy')
            ? this.getLang()!.common.disable
            : this.getLang()!.common.enable
        } ${this.getLang()!.common.title}`,
        click: this.toggleTrojan
      },
      ...(isLinux
        ? []
        : [
            {
              type: 'separator'
            },
            {
              type: 'checkbox',
              label: this.getLang()!.views.settings.proxyModes.local,
              checked: this.getProxyMode() === 'local',
              click: () => {
                this.setProxyMode('local');
              }
            },
            {
              type: 'checkbox',
              label: this.getLang()!.views.settings.proxyModes.global,
              checked: this.getProxyMode() === 'global',
              click: () => {
                this.setProxyMode('global');
              }
            },
            {
              type: 'checkbox',
              label: this.getLang()!.views.settings.proxyModes.pac,
              checked: this.getProxyMode() === 'pac',
              click: () => {
                this.setProxyMode('pac');
              }
            }
          ]),
      { type: 'separator' },
      { label: this.getLang()!.tray.quit, click: this.quit }
    ];
    const contextMenu = Menu.buildFromTemplate(
      menuTemplate as Array<MenuItemConstructorOptions>
    );
    this.menu = contextMenu;
    if (this.tray) {
      if (isLinux) {
        this.tray.setContextMenu(contextMenu);
      } else {
        this.tray.popUpContextMenu(contextMenu);
      }
    }
  }

  getLang() {
    const lang = (store.get('language') as string) || 'en';
    switch (lang) {
      case 'en':
        return en;
      case 'zh-CN':
        return zh;
    }
  }

  async toggleTrojan() {
    if (store.get('enableProxy')) {
      await trojan.stop();
      store.set('enableProxy', false);
    } else {
      await trojan.start();
      store.set('enableProxy', true);
    }
  }

  async quit() {
    appWindow.isQuiting = true;
    await client.stop();
    app.quit();
  }
}

export default new TrayMenu();
