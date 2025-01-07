<template>
  <div>
    <ModalInter :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">发送<span class="testnet-header" v-if="isTestnet">(Testnet)</span>
        </h2>
        <div>
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance" currency="CT"/> 可用
          </span>
        </div>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-310">
          <div v-if="item.type == 1">
            <label for="send-send" class="label">发送到</label>
            <el-input
              size="large"
              id="send-send"
              placeholder="CT 地址"
              ref="item.to"
              type="text"
              disabled
              :value="item.to"
            />

          </div>
          <div v-if="item.type == 2">
            <label for="send-send" class="label">交互地址</label>
            <el-input
              size="large"
              id="send-send"
              placeholder="合约地址"
              ref="item.contractAddress"
              type="text"
              disabled
              :value="item.contractAddress"
            />

          </div>

          <label for="amount-send">数量</label>
          <div class="relative input-wrap">
            <el-input
              size="large"
              type="number"
              id="amount-send"
              placeholder="0.00"
              disabled
              :value="item.value"
              class="placeholder-white placeholder-opacity-100"
            />
            <span class="absolute right-0 text-xl currentColor top-23">CT</span>

          </div>

        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">返回</button>
            <button class="w-full button button--success" @click="readySend">发送</button>
          </div>
        </div>
      </template>
    </ModalInter>

    <ModalInter :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">发送<span class="testnet-header" v-if="isTestnet">(Testnet)</span>
        </h2>
        <div>
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance" currency="CT"/> 可用
        </span>
        </div>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-310">
          <div v-if="item.type == 1" class="form-group mb-14">
            <label class="label">发送到</label>
            <HashLink to="explorer" :wallet="item.to"/>
          </div>
          <div v-if="item.type == 2" class="form-group mb-14">
            <label class="label">合约地址</label>
            <HashLink to="explorer" :wallet="item.contractAddress"/>
          </div>
          <div class="form-group mb-14 text-xl" v-show="false">
            <label class="label">备忘录</label>
            <span class="break-all">{{ memo || 'None' }}</span>
          </div>
          <div class="mb-16 form-group">
            <label>数量</label>
            <Amount :value="amountParsed" :currency="'CT'" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>手续费</label>
            <Amount :value="gas" currency="CT" short sub/>
          </div>
          <div class="mb-0 form-group">
            <label>接收人收到</label>
            <Amount :value="amountParsedCalc" :currency="CT" short sub/>
          </div>
          <div v-if="item.type == 2" class="form-group mb-14">
            <label class="label">合约方法</label>
            <span class="break-all">{{ item.method }}</span>
          </div>
          <div v-if="item.type == 2" class="form-group mb-14">
            <label class="label">合约参数</label>
            <span class="break-all">{{ item.params }}</span>
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
            <button class="w-full button button--outline-success" @click="close">关闭</button>
            <button
              :disabled="!canSend"
              @click="send"
              class="w-full button button--success"
            >确认交易
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

    <ModalInter :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <h2 class="mb-8">交易已发送<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">
          <div v-if="item.type == 1" class="form-group mb-14">
            <label class="label">发送到</label>
            <HashLink to="explorer" :wallet="item.to"/>
          </div>
          <div v-if="item.type == 2" class="form-group mb-14">
            <label class="label">合约地址</label>
            <HashLink to="explorer" :wallet="item.contractAddress"/>
          </div>
          <div class="form-group mb-14 text-xl" v-show="false">
            <label class="label">备忘录</label>
            <span class="break-all">{{ completedTx.data || 'None' }}</span>
          </div>
          <div class="mb-14 form-group">
            <label>数量</label>
            <Amount :value="item.value" currency="CT" short sub/>
          </div>
          <div class="mb-14 form-group">
            <label>手续费</label>
            <Amount :value="(completedTx.gasPrice * completedTx.gasLimit)/1e18" currency="CT" short sub/>
          </div>
          <div class="mb-14 form-group">
            <label>接收人将接收</label>
            <Amount :value="item.value" :currency="item.name" short sub/>
          </div>
          <div v-if="item.type == 2" class="form-group mb-14">
            <label class="label">合约方法</label>
            <span class="break-all">{{ item.method }}</span>
          </div>
          <div v-if="item.type == 2" class="form-group mb-14">
            <label class="label">合约参数</label>
            <span class="break-all">{{ item.params }}</span>
          </div>
          <div class="form-group mb-14">
            <label>交易哈希</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
          <button
            @click="afterSend"
            class="block w-full mx-auto text-center button button--success md:w-1/2"
          >关闭
          </button>
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

const Web3 = require('web3')
const ABI_const = require('@/contract/ABI_const.js')
const ethers = require('ethers')
const memoRegexp = /^[a-zA-Z0-9\s-]{0,32}$/
const TRANSACTION_RECEIPT_STATUS = {
  SUCCESS: 1,
  REVERTED: 0
}
const gasPrice = 4800
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
    close: Function,
    visible: Boolean,
    afterSendFun: Function,
    item: Object
  },
  data() {
    return {
      step: 1,

      recipient: '',
      amount: '',
      memo: '',
      password: '',
      passwordError: '',

      completedTx: null,
      submitError: '',
      gas: 0,
      loading: false
    }
  },
  validations() {
    let amountV = []
    if (this.item == null || this.item.type == '1') {
      amountV = [
        validation.required,
        ...validation.amount(this.balance, this.amountParsed)
      ]
    }
    else {
      amountV = [
        validation.required,
        ...validation.amount(this.item.balance, this.amountParsed)
      ]
    }

    return {
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce']),
    amountParsed() {
      return parseAmount(this.item.value)
    },
    amountParsedCalc() {
      if (this.item.type == 1) {
        // return parseAmount(this.item.value) - this.gas
        return parseAmount(this.item.value)
      }
      else {
        return parseAmount(this.item.value)
      }
    },
    canSend() {
      return !this.v$.$invalid
    },
    isMaxAmountEntered() {
      switch (this.item.type) {
      case 'ERC-20':
      case 'ERC-721':
      case 'ERC-1155':
        return this.item.balance > 0 && this.amountParsed === this.item.balance / 1e6
      default:
        return this.balance > 0 && this.amountParsed === this.balance / 1e6
      }
    },
    formattedAmount() {
      this.item.decimals = this.item.decimals == '' ? 0 : this.item.decimals
      return ethers.utils.formatUnits(this.item.balance, this.item.decimals)
    }
  },
  watch: {
    submitError(newVal, oldVal) {
      if (newVal === oldVal) return
      if (newVal) {
        this.afterSendFun(0, {message: '交易失败:' + newVal, result: {}}, this.item.type)
      }
    },
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
      }
    },
    'item.type': {
      handler(newVal, oldVal) {
        if (newVal > 0) {
          this.readySend()
        }
      },
      immediate: true
      // deep: true
    }
  },
  async mounted() {
    // await this.readySend()
  },
  methods: {
    afterSend() {
      this.afterSendFun(1, {message: '交易已经发送', result: this.completedTx}, this.item.type)
    },
    parseAmount() {
      return ethers.utils.parseUnits(this.item.value, this.item.decimals)
    },
    async gasCalc() {
      this.gas = await this.easGasSend()
      this.goto(2)
    },
    cancel() {
      this.reset()
      this.afterSendFun(0, {
        message: '用户拒绝了请求',
        result: {}
      })
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
    goto(step) {
      this.step = step
    },
    async readySend() {
      // validate only step 1
      // 这里计算gas
      const that = this
      this.loading = true
      window.setTimeout(() => {
        that.gasCalc()
      }, 500)

    },
    reset() {
      this.goto(1)

      this.recipient = ''
      this.amount = ''
      this.memo = ''
      this.password = ''
      this.passwordError = ''

      this.completedTx = null
      this.submitError = ''

      this.v$.$reset()
    },
    async easGasSend() {
      // 转账为固定手续费
      let gasLimit

      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      let override = {}
      let gasLimitR = {}
      this.loading = true
      switch (this.item.type) {
      case 2:
        override = {
          from: this.address,
          value: this.item.value
        }
        gasLimitR = await contract_gas_call_override(
          ethers,
          this.item.contractAddress,
          JSON.parse(this.item.abi),
          this.item.method,
          customHttpProvider,
          JSON.parse(this.item.params),
          override
        )
        if (gasLimitR.err != null) {
          console.log('error:', gasLimitR.err)
          this.loading = false
          this.submitError = gasLimitR.err
          this.close(gasLimitR.err)
          return 0
        }
        gasLimit = gasLimitR.data.toString()
        this.loading = false
        return gasPrice * gasLimit / 1e9

      case 1:
        gasLimit = 21000
        this.loading = false
        return gasPrice * gasLimit / 1e9
      default:
        this.loading = false
        return 0
      }

    },
    async send() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      const wallet = new ethers.Wallet(privateKey, customHttpProvider)
      // create tx

      let tx
      let override
      let recept
      this.loading = true
      switch (this.item.type) {

      case 2:
        override = {
          from: this.address,
          value: this.item.value
        }
        tx = await contract_call_override(
          ethers,
          wallet,
          this.item.contractAddress,
          JSON.parse(this.item.abi),
          this.item.method,
          customHttpProvider,
          JSON.parse(this.item.params),
          override
        )

        console.log('tx:', tx)
        if (tx.data == null) {
          console.log('发生错误')
          this.submitError = tx.err
          this.loading = false
          return
        }
        try {
          recept = await customHttpProvider
            .waitForTransaction(tx.data.hash)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
            })
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw  'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = tx.data
            this.goto(3)
          }
          else {
            this.loading = false
            this.submitError = recept.err
          }

        }
        catch (e) {
          console.error(e)
          this.loading = false
          this.submitError = e.message
        }

        break
      case 1:
      default:
        tx = {
          from: this.address,
          to: this.item.to,
          // ... or supports ENS names
          // to: "ricmoo.firefly.eth"
          // We must pass in the amount as wei (1 ether = 1e18 wei), so we
          // use this convenience function to convert ether to wei.
          // gasPrice: ethers.utils.hexlify(0),
          value: ethers.utils.parseEther((this.amountParsedCalc).toString())
          // nonce: this.nextNonce
        }

        // submit tx to blockchain
        try {

          const results = await wallet.sendTransaction(tx)

          recept = await customHttpProvider
            .waitForTransaction(results.hash)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
            })
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw  'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = results
            this.goto(3)
          }
          else {
            this.submitError = results[0].reason
          }
        }
        catch (err) {
          console.error(err)
          this.loading = false
          this.submitError = err.message
        }
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
