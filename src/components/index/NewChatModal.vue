<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>新建聊天</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">

        <div class="form-group" :class="{'form-group__error': v$.toAddress.$error}">
          <label for="toAddress">接收人</label>
          <div class="relative">
            <el-input
              size="large"
              type="text"
              autocomplete="off"
              placeholder="请输入一个钱包地址"
              id="toAddress"
              v-model="v$.toAddress.$model"
            />
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group__error input-error" v-for="error of v$.toAddress.$errors" :key="error.$uid">
            {{ error.$message }}
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group__error input-error" v-if="passwordError && !v$.toAddress.$dirty">{{ passwordError }}
          </div>
        </div>
        <div class="form-group" :class="{'form-group__error': v$.firstMessage.$error}">
          <label for="firstMessage">消息内容</label>
          <div class="relative">
            <el-input
              size="large"
              v-model="v$.firstMessage.$model"
              :rows="3"
              type="textarea"
              id="firstMessage"
              placeholder="请输入消息内容"
            />

<!--            <input-->
<!--              type="text"-->
<!--              autocomplete="off"-->
<!--              placeholder="请输入消息内容"-->
<!--              id="firstMessage"-->
<!--              v-model="v$.firstMessage.$model"-->
<!--            />-->
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group__error input-error" v-for="error of v$.firstMessage.$errors" :key="error.$uid">
            {{ error.$message }}
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group__error input-error" v-if="passwordError && !v$.firstMessage.$dirty">{{ passwordError }}
          </div>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="px-24 pt-48 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
        <form>
          <div class="flex items-start leading-8 text-gray mb-14">
          <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
            <ShieldExclamationIcon/>
          </span>
            <p>确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了详细信息，您将无法访问您的钱包。请输入您的密码以确认您已备份您的详细信息。</p>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.password.$error}">
            <label for="password">输入密码以加密此会话</label>
            <div class="relative input-wrap">

              <el-input
                size="large"
                type="password"
                @keypress="createOnEnter"
                autocomplete="off"
                placeholder="输入你的密码"

                v-model="v$.password.$model"
                :prefix-icon="LockOpenIcon"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{ passwordError }}
            </div>
          </div>
        </form>
        <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="cancel">返回</button>
          <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="create">下一步</button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import {ClipboardCopyIcon, LockOpenIcon, RefreshIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {required as _required, helpers} from '@vuelidate/validators'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import Modal from '../Modal'

const ethers = require('ethers')
const Web3 = require('web3')

const ethUtil = require('ethereumjs-util')

export default {
  name: 'NewChatModal',
  components: {
    ClipboardCopyIcon,
    LockOpenIcon,
    Modal,
    RefreshIcon,
    ShieldExclamationIcon
  },
  props: {
    afterCreate: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      toAddress: '',
      address: '',
      privateKey: '',
      publicKey: '',

      password: '',
      firstMessage: '',
      passwordError: '',
      canCopy: !!navigator.clipboard
    }
  },
  validations() {
    return {
      toAddress: [
        helpers.withMessage('需要一个值。', _required)
      ],
      firstMessage: [
        helpers.withMessage('需要一个值。', _required)
      ],
      password: [
        validation.passwordRequired,
        validation.passwordLength
      ]
    }
  },
  computed: {
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    async create() {
      if (!await this.v$.$validate()) return
      // 判断 如果已经存在第一个钱包, 就进行密码验证
      if (!await this.checkPassword()) return

      // 发送消息
      this.afterCreate(this.toAddress, this.firstMessage, this.password)
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
        return false
      }
    },
    createOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.create()
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },
    reset() {
      this.password = ''
      this.confirmPhrase = ''
      this.v$.$reset()
    }
  },
  async mounted() {

  },
  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon
    }
  }
}
</script>

<style scoped>
.private-key {
  width: 32ch
}

.on-clicked-effect {
  transition: all 0.4s ease-in;
}

.on-clicked-effect:before {
  content: '';
  background-color: aliceblue;
  border-radius: 50%;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(0.001, 0.001);
}

.on-clicked-effect:focus:not(:active) {
  position: relative;
  display: inline-block;
  outline: 0;
}

.on-clicked-effect:focus:not(:active):before {
  animation: clicked_animation 0.8s ease-out;
}

@keyframes clicked_animation {
  50% {
    transform: scale(1.5, 1.5);
    opacity: 0;
  }
  99% {
    transform: scale(0.001, 0.001);
    opacity: 0;
  }
  100% {
    transform: scale(0.001, 0.001);
    opacity: 1;
  }
}
</style>
