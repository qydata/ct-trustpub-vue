// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.
const webpack = require('webpack')
const path = require('path'); // 引入 path 模块
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /node_modules[\\/]@web3modal/,
          loader: 'babel-loader'
        },
        {
          test: /\.js$/,  // 或者 .jsx, .ts, .tsx
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-runtime']
            }
          }
        }
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all', // 自动分割所有引入的模块
        minSize: 20000, // 最小大小 20KB
        maxSize: 500000 // 最大大小 500KB
      },
      minimize: true
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // 如果没有设置这个别名，可能会找不到文件
      },
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        https: require.resolve('https-browserify'),
        http: require.resolve('http-browserify'),
        constants: require.resolve('constants-browserify')  // 提供常量的浏览器版本
      }

    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    ]
  },
  productionSourceMap: false,
  assetsDir: 'assets/',
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        // This sets the pre-render title (see also src/mixins/titleMixing.js)
        args[0].title = process.env.VUE_APP_IS_TESTNET === 'true' ? 'Testnet (CT) 链上付' : '链上付'
        return args
      })
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    open: false,
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      '/api': {
        target: 'https://wallet.ctblock.cn',
        // target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          // '^/api': '/ct-server-php'
        }
      },
      '/blockChain': {
        target: 'https://wallet.ctblock.cn/api/blockChain',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/blockChain': ''
        }
      }
    }
  }
}
