<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card>

      <template v-slot:title>
        <h2>导入钱包</h2>
      </template>

      <v-form validate-on="submit lazy"
              ref="myForm">

        <v-list lines="six">
          <v-list-item
            title="输入私钥"
          >
            <v-text-field
              v-model="privateKey"
              :rules="privateKeyRules"
              autocomplete="off"
              :prepend-icon="KeyIcon"
              label="你的私钥*"
              type="text"
              required
              clearable/>
          </v-list-item>
          <v-list-item
            title="输入密码"
          >
            <v-text-field
              v-model="password"
              :rules="passwordRules"
              autocomplete="off"
              label="输入你的密码*"
              :counter="8"

              :type="showPassword ? 'text' : 'password'"
              :prepend-icon="LockOpenIcon"
              :append-icon="showPassword ? EyeIcon : EyeOffIcon"
              @click:append="showPassword = !showPassword"
              required
              clearable/>

          </v-list-item>
          <v-list-item
            title="确认密码"
          >
            <v-text-field
              :error-messages="repeatPasswordError"
              v-model="repeatPassword"
              :rules="repeatPasswordRules"
              autocomplete="off"
              label="重复你的密码*"
              :counter="8"
              @keypress="restoreOnEnter"
              :type="showPassword ? 'text' : 'password'"
              :prepend-icon="LockOpenIcon"
              :append-icon="showPassword ? EyeIcon : EyeOffIcon"
              @click:append="showPassword = !showPassword"
              required
              clearable/>

          </v-list-item>

          <v-list-item>
            <v-row>
              <v-col cols="6">
                <v-btn rounded="xl" block size="x-large"
                       variant="tonal" @click="cancel">返回
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn rounded="xl" block size="x-large"
                       @click="restore">导入
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </v-list>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import {KeyIcon, LockOpenIcon, EyeOffIcon, EyeIcon} from '@heroicons/vue/outline'
import * as storage from '@/utils/storage'

const ethUtil = require('ethereumjs-util')
const privateKeyRegexp = /^(0x)?[a-fA-F0-9]{64}$/
import {EditPen} from '@element-plus/icons-vue'

export default {
  name: 'RestoreModal',
  components: {},
  props: {
    afterRestore: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      privateKey: '',
      privateKeyRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        },
        value => {
          if (privateKeyRegexp.test(value)) return true
          return '无效的私钥。'
        }
      ],
      repeatPasswordRules: [
        value => {
          if (value == this.password) return true
          return '前后密码不匹配。'
        }
      ],
      passwordRules: [
        value => {
          if (value) return true
          return '需要密码。'
        },
        value => {
          if (value?.length >= 8) return true
          return '密码必须大于 8 个字符。'
        }
      ],
      password: '',
      showPassword: false,
      repeatPassword: '',
      localVisible: this.visible
    }
  },
  computed: {},
  watch: {
    visible(newValue) {
      // 当父组件的 prop 更新时，更新本地副本
      this.localVisible = newValue
    },
    localVisible(newValue) {
      // 当本地副本改变时，触发事件通知父组件更新
      this.$emit('update:visible', newValue)
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    reset() {
      this.privateKey = ''
      this.password = ''
      this.repeatPassword = ''
    },
    async restore() {
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      let publicKey = ethUtil.privateToPublic(new Buffer(ethUtil.stripHexPrefix(this.privateKey), 'hex'))
      const address = ethUtil.addHexPrefix(ethUtil.publicToAddress(publicKey).toString('hex'))

      publicKey = ethUtil.bufferToHex(publicKey)
      await storage.setWallet({privateKey: this.privateKey, publicKey}, '账户1', this.password)
      await storage.setWalletVersion(storage.getHighestWalletVersion())
      this.$store.commit('setAddress', address)
      this.$store.commit('unlock')
      this.$store.dispatch('refresh')

      this.afterRestore()
    },
    restoreOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.restore()
    }
  },
  setup() {
    return {
      LockOpenIcon,
      EditPen,
      KeyIcon, EyeOffIcon, EyeIcon
    }
  }
}
</script>
