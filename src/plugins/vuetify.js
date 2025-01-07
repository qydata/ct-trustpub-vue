// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import {createVuetify} from 'vuetify'
import {md3} from 'vuetify/blueprints'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {aliases, mdi} from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  theme: {
    // 可以选择 'dark' 或 'light'
    // defaultTheme: 'light'
    defaultTheme: 'dark'
  },
  // 可选：选择 Vuetify 3 的设计蓝图
  blueprint: md3,
  components,
  directives,
  icons: {
    // 使用 Material Design Icons
    defaultSet: 'mdi',
    sets: {
      // 使用 MDI 图标集
      mdi
    },
    // 添加别名
    aliases
  }
})

export default vuetify
