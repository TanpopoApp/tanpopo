import { app, ipcMain, dialog, OpenDialogSyncOptions } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import {
  EXPORT_SETTINGS,
  EXPORT_SETTINGS_SUCCESS,
  IMPORT_SETTINGS,
  IMPORT_SETTINGS_SUCCESS
} from '@/utils/const';

class Dialog {
  async init() {
    ipcMain.on(EXPORT_SETTINGS, async event => {
      const result = await this.exportConfig('tanpopo-config.json');
      if (result) {
        event.reply(EXPORT_SETTINGS_SUCCESS);
      }
    });
    ipcMain.on(IMPORT_SETTINGS, async event => {
      const configData = await this.importConfig();
      if (configData) {
        event.reply(IMPORT_SETTINGS_SUCCESS, configData);
      }
    });
  }

  async exportConfig(fileName: string) {
    const appDataPath = app.getPath('userData');
    const configPath = path.resolve(appDataPath, 'config.json');
    const configData = await fs.readJson(configPath);
    const options = {
      title: 'Save the config',
      defaultPath: fileName
    };
    const filePath = dialog.showSaveDialogSync(options);
    if (filePath) {
      await fs.outputJson(filePath, configData);
      return true;
    }
    return false;
  }

  async importConfig() {
    const options: OpenDialogSyncOptions = {
      title: 'Select the config',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    };
    const filePaths = dialog.showOpenDialogSync(options);
    if (filePaths) {
      return await fs.readJson(filePaths[0]);
    }
  }
}

export default new Dialog();
