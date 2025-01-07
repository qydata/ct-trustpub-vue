<template>
  <div>

    <ModalInter :close="cancel" :visible="visible">
      <template v-slot:header>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-310" v-if="transaction.type == 1">
          <div class="form-group mb-14">
            <label class="label">发送自</label>
            <HashLink to="explorer" :wallet="transaction.from"/>
          </div>
          <div class="form-group mb-14">
            <label class="label">发送到(或合约地址)</label>
            <HashLink to="explorer" :wallet="transaction.to"/>
          </div>
          <div class="mb-16 form-group">
            <label>数量</label>
            <Amount :value="amountParsed" :currency="'CT'" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Gas限制</label>
            <Amount :value="transaction.gasLimit" :currency="''" sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Gas价格</label>
            <Amount :value="transaction.gasPrice" :currency="''" sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Nonce(交易数)</label>
            <Amount :value="transaction.nonce" short sub/>
          </div>
          <div class="form-group mb-14 text-xl">
            <label class="label">交互数据</label>
            <span class="break-all">{{ transaction.data }}</span>
          </div>
        </div>
        <div class="pb-14 min-h-310" v-else-if="transaction.type == 2">
          <div class="form-group mb-14 text-xl">
            <label class="label">交互数据</label>
            <span class="break-all">{{ transaction.stractSignMsg }}</span>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <form>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group"
                 :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
              <label for="pass-step">输入密码</label>
              <div class="relative input-wrap">
                <el-input
                  size="large"
                  type="password"
                  autocomplete="off"
                  @keypress="sendOnEnter"
                  placeholder="你的密码"
                  id="pass-step"
                  v-model="v$.password.$model"
                  :prefix-icon="LockOpenIcon"
                />
              </div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">
                {{ passwordError }}
              </div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">拒绝签名</button>
            <button
              :disabled="!canSend"
              @click="send"
              class="w-full button button--success"
            >确认签名
            </button>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div v-if="submitError"
               class="px-20 py-20 my-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
                {{ submitError }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </ModalInter>

    <LoadingModal :visible="loading"/>
  </div>
</template>

<script>
/*global process*/

import LoadingModal from '@/components/index/LoadingModal'
import {parseAmount} from '@/utils/form'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {LockOpenIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {mapState} from 'vuex'
import Amount from '../Amount'
import HashLink from '../HashLink'
import ModalInter from '../ModalInter'
import Radio from '../Radio'

const EthereumTx = require('@ethereumjs/tx').Transaction
const Common = require('ethereumjs-common')
const Web3 = require('web3')
const ABI_const = require('@/contract/ABI_const.js')
const ethers = require('ethers')
const TRANSACTION_RECEIPT_STATUS = {
  SUCCESS: 1,
  REVERTED: 0
}
const sigUtil = require('eth-sig-util')
const {contract_static_call, contract_gas_call_override, contract_call_override} = require('../../contract/ChainCall')
export default {
  name: 'InterSendModal',
  components: {
    LoadingModal,
    Amount,
    HashLink,
    LockOpenIcon,
    ModalInter,
    Radio
  },
  props: {
    visible: Boolean,
    afterSignFun: Function,
    transaction: Object
  },
  data() {
    return {
      recipient: '',
      amount: '',
      memo: '',
      password: '',
      passwordError: '',
      completedTx: null,
      submitError: '',
      nonce: 0,
      loading: false
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce']),
    amountParsed() {
      return parseAmount(this.transaction.value)
    },
    amountParsedCalc() {
      if (this.transaction.type == 1) {
        return parseAmount(this.transaction.value) - this.gas
      }
      else {
        return parseAmount(this.transaction.value)
      }
    },
    canSend() {
      if (this.transaction.type == 1) {
        return !this.v$.$invalid
      }
      else if (this.transaction.type == 2) {
        return true
      }
      return false
    }
  },
  watch: {
    submitError(newVal, oldVal) {
      if (newVal === oldVal) return
      if (newVal) {
        this.afterSignFun(0, {message: '交易失败:' + newVal, result: {}}, this.transaction.type)
      }
    },
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
      }
    }
  },
  async mounted() {
    await this.readySend()
  },
  methods: {
    afterSend() {
      this.afterSignFun(1, {message: '交易已经发送', result: this.completedTx}, this.transaction.type)
    },
    parseAmount() {
      return ethers.utils.parseUnits(this.transaction.value, this.transaction.decimals)
    },
    async gasCalc() {
      await this.easGasSend()
    },
    cancel() {
      this.reset()
      this.afterSignFun(0, {
        message: '用户拒绝了请求',
        result: {}
      },
      this.transaction.type)
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
        return false
      }
    },
    async readySend() {
      // validate only step 1
      // 这里计算gas
      const that = this
      this.loading = true
      // let customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
      //   chainId: 27
      // })
      // // 判断地址是否是合约地址
      // let byteCode = await customHttpProvider.getCode('0xBaE5bd3A90c89335269252dDD4E8dF0314748ced');
      window.setTimeout(() => {
        that.gasCalc()
      }, 500)

    },
    reset() {
      this.password = ''
      this.passwordError = ''
      this.submitError = ''
      this.v$.$reset()
    },
    async easGasSend() {
      //  对数据做验证判断
      this.loading = false
    },
    async send() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKeyA = await storage.getPrivateKey(this.password)

      if (this.transaction.type == 1) {
        const rawTx = {
          // nonce: ct3.utils.toHex(ct3.utils.hexToNumber(("0x" + nonce))),
          from: Web3.utils.toHex(this.transaction.from),
          to: Web3.utils.toHex(this.transaction.to),
          nonce: Web3.utils.toHex(this.transaction.nonce),
          gasLimit: Web3.utils.toHex(parseInt(this.transaction.gasLimit).toString()),
          gasPrice: Web3.utils.toHex(Web3.utils.toWei((parseInt(this.transaction.gasPrice).toString()), 'gwei')),
          // value: ct3.utils.toHex(value),
          value: Web3.utils.toHex(Web3.utils.toWei(parseInt(this.transaction.value).toString())),
          data: Web3.utils.toHex(this.transaction.data)
        }
        const privateKey = Buffer.from(privateKeyA, 'hex')
        const customCommon = Common.default.forCustomChain(
          'mainnet',
          {
            name: 'ctChain',
            chainId: 27,
            networkId: 27
          },
          'petersburg'
        )
        const tx = new EthereumTx(rawTx, {common: customCommon})
        tx.sign(privateKey)
        const serializedTx = tx.serialize()
        const serializedTxStr = '0x' + serializedTx.toString('hex')

        this.afterSignFun(1, {message: '签名成功', result: serializedTxStr}, this.transaction.type)

      }
      else if (this.transaction.type == 2) {
        const privateKey = Buffer.from(privateKeyA, 'hex')
        const signature = sigUtil.signTypedData_v4(privateKey, {data: this.transaction.stractSignMsg})
        this.afterSignFun(1, {message: '签名成功', result: signature}, this.transaction.type)
      }
      else {
        this.afterSignFun(1, {message: '签名失败', result: '未知的签名类型'}, this.transaction.type)
      }

    },
    sendOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.send()
    }
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
</style>
