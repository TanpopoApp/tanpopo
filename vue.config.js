'use strict';

module.exports = {
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    port: 3300
  },
  configureWebpack: config => {
    if (process.env.VUE_APP_TROJAN_ENV === 'production') {
      config.devtool = 'hidden-source-map';
    }
  },
  pluginOptions: {
    electronBuilder: {
      // builderOptions: {
      //   extraResources: [
      //     {
      //       from: 'src/helper',
      //       to: 'helper',
      //       filter: ['**/*']
      //     }
      //   ]
      // },
      nodeIntegration: true,
      // Use this to change the entrypoint of your app's main process
      mainProcessFile: 'src/main/index.ts',
      mainProcessWatch: ['src/main/**/*.ts']
    }
  }
};
