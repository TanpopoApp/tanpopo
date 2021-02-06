'use strict';
const path = require('path');
const ICON_PATH = path.resolve(__dirname, 'src/assets/icons');

module.exports = {
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    port: 3300
  },
  chainWebpack: config => {
    config.module
      .rule('svg')
      .exclude.add(ICON_PATH)
      .end();
  },
  configureWebpack: config => {
    if (process.env.VUE_APP_TROJAN_ENV === 'production') {
      config.devtool = 'hidden-source-map';
    }

    return {
      module: {
        rules: [
          {
            test: /\.(gif|png|jpe?g|svg)$/i,
            exclude: [ICON_PATH],
            use: [
              {
                loader: 'image-webpack-loader',
                options: {
                  mozjpeg: {
                    progressive: true,
                    quality: 65
                  },
                  // optipng.enabled: false will disable optipng
                  optipng: {
                    enabled: false
                  },
                  pngquant: {
                    quality: [0.65, 0.9],
                    speed: 4
                  },
                  gifsicle: {
                    interlaced: false
                  },
                  svgo: {
                    plugins: [
                      {
                        cleanupIDs: false
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            test: /\.svg$/i,
            include: [ICON_PATH],
            use: [
              {
                loader: 'svg-sprite-loader',
                options: {
                  symbolId: 'icon-[name]'
                }
              },
              {
                loader: 'image-webpack-loader',
                options: {
                  svgo: {
                    plugins: [
                      {
                        cleanupIDs: false
                      }
                    ]
                  }
                }
              }
            ]
          }
        ]
      },
      plugins: []
    };
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
