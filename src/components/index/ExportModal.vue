<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">
    <v-card title="导出私钥">
      <v-card-text>

        <v-list lines="three">
          <v-banner color="warning" :icon="ShieldExclamationIcon" v-if="!privateKey" text="在下面输入您的密码以解密并显示您的私钥。 这将使您能够备份您的私钥并在其他浏览器和设备上恢复您的钱包。
            不要与其他任何人共享您的私钥，并在您的周围可见时注意您的周围环境。">
          </v-banner>
          <div>
            <v-list-item v-if="!privateKey">
              <v-form validate-on="submit lazy"
                      ref="myForm">
                <v-list-item
                  title="输入密码以导出您的私钥"
                >
                  <v-text-field
                    :error-messages="passwordError"
                    v-model="password"
                    :rules="passwordRules"
                    autocomplete="off"
                    label="你的密码*"
                    :counter="8"
                    @keypress="exportOnEnter"

                    :type="showPassword ? 'text' : 'password'"
                    :prepend-icon="LockOpenIcon"
                    :append-icon="showPassword ? EyeIcon : EyeOffIcon"
                    @click:append="showPassword = !showPassword"
                    required
                    clearable/>

                  <small class="text-caption text-medium-emphasis">*表示必填字段</small>
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
                             @click="exportKey">导出
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-form>

            </v-list-item>
            <v-list-item v-else>
              <v-list-item
                title="钱包地址。"
                :subtitle="address"
              >
                <template v-slot:append>
                  <v-btn v-if="canCopy"
                         @click.prevent="copyToClipboard(address)"
                         :icon="ClipboardCopyIcon" variant="text">
                  </v-btn>
                </template>
              </v-list-item>
              <v-list-item
                title="私钥"
                :subtitle="privateKey"
              >
                <template v-slot:append>
                  <v-btn v-if="canCopy"
                         @click.prevent="copyToClipboard(privateKey)"
                         :icon="ClipboardCopyIcon" variant="text">
                  </v-btn>
                </template>
              </v-list-item>

              <v-list-item>
                <v-btn rounded="xl" block size="x-large"
                       @click="cancel">完成
                </v-btn>
              </v-list-item>
            </v-list-item>
          </div>

        </v-list>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import * as storage from '@/utils/storage'
import {mapState} from 'vuex'
import {ClipboardCopyIcon, LockOpenIcon, EyeIcon, EyeOffIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'

export default {
  name: 'ExportKey',
  components: {},
  props: {
    close: Function,
    visible: Boolean
  },
  computed: {
    ...mapState(['address'])
  },
  data() {
    return {
      password: '',
      showPassword: false,
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
      passwordError: [],
      privateKey: '',
      canCopy: !!navigator.clipboard,

      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible
    }
  }, watch: {
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
      this.password = ''
      this.privateKey = ''
      this.passwordError = []
    },
    async checkPassword() {
      if (await storage.comparePassword(this.password)) {
        this.passwordError = []
        return true
      }
      else {
        this.passwordError = ['密码错误.']
        return false
      }
    },
    async exportKey() {
      this.passwordError = []
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      if (!await this.checkPassword()) return

      this.privateKey = await storage.getPrivateKey(this.password)
    },
    exportOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.exportKey()
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    }
  },
  setup() {
    return {
      LockOpenIcon, ShieldExclamationIcon, EyeIcon, EyeOffIcon, ClipboardCopyIcon
    }
  }
}
</script>

<style scoped>
</style>
