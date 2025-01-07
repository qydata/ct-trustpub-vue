// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import 'font-awesome/css/font-awesome.css'
import './tailwind.css'
// main.ts
// if you just want to import css
/*global process*/
import {createApp} from 'vue'
import VueCookies from 'vue-cookies'
import App from './App.vue'

import titleMixin from './mixins/titleMixin'
// 引入 Vuetify 插件
import vuetify from './plugins/vuetify'
import './providers/InPageProvider'
// 如果使用自定义字体
import {loadFonts} from './plugins/webfontloader'
import router from './router'
import Store from './store'

import './utils'
// 加载自定义字体（如果需要）
loadFonts()

const WALLET_REFRESH_INTERVAL = 30 * 1000
const init = async () => {
  const store = await Store.init()

  const app = createApp(App, {store}).use(router)
    .use(store)
    .use(VueCookies)
    // 使用Vuetify
    .use(vuetify)
    .mixin(titleMixin)
    .mixin({
      data() {
        return {
          isTestnet: process.env.VUE_APP_IS_TESTNET === 'true'
        }
      }
    })

  // 手动将 store 挂载到 globalProperties
  app.config.globalProperties.$store = store
  // 通过 globalProperties 添加全局方法
  app.config.globalProperties.$message = {
    error(msg) {
      // app.config.globalProperties.globalProperties.$store.commit('showAlert', {message: msg, type: 'error'})
      store.commit('showAlert', {message: msg, type: 'error'})
    },
    success(msg) {
      // app.config.globalProperties.globalProperties.$store.commit('showAlert', {message: msg, type: 'success'})
      store.commit('showAlert', {message: msg, type: 'success'})
    },
    info(msg) {
      // app.config.globalProperties.globalProperties.$store.commit('showAlert', {message: msg, type: 'info'})
      store.commit('showAlert', {message: msg, type: 'info'})
    }
  }
  let newApp = app.mount('#app')
  newApp.$router.beforeResolve((to) => {
    // 如果钱包是锁定状态，直接重定向到首页
    if (store.state.locked && to.name !== 'Index') {
      // 记录要访问的地址
      sessionStorage.setItem('RE_HREF', window.location.pathname)
      sessionStorage.setItem('RE_HREF_S', window.location.search)
      return {name: 'Index'}
    }
    else {
      return true
    }
  })

  if (store.state.address) store.dispatch('refresh')
  setInterval(() => store.dispatch('backgroundRefresh', newApp.$router), WALLET_REFRESH_INTERVAL)
}
window.MyNamespace = window.MyNamespace || {}
window.MyNamespace.utils = {
  sayHi: function () {
    console.log('Hi from MyNamespace!')
  },
  version: '2.0.0'
}
init()
