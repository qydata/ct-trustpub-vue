<template>
  <div>
    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible1">

      <v-card :title=" p_type ? '赞成声明' : '反对声明' " :text="'订单号  ' + shortHash(publicity.id)">
        <v-container>
          <v-card-item>
            <v-card>
              <template v-slot:title>
                <label>充值金额</label>
                <Amount :value="publicity._chainpayOrder_value" decimalPlaces="2" currency="CNY" short sub/>
              </template>
            </v-card>
          </v-card-item>

          <v-card-item v-if="submitError">
            <template v-slot:subtitle>
              <small class="text-caption text-medium-emphasis">发生了错误 ({{ submitError }})。 请再试一次。</small>
            </template>
          </v-card-item>

          <v-card-item>
            <v-row>
              <v-col cols="6">
                <v-btn variant="tonal" block size="large" plain @click="cancel">返回</v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn :loading="loading"
                       @click="handlerZf"
                       color="primary"
                       size="large" block
                >{{ p_type ? '赞成' : '反对' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-item>
        </v-container>
      </v-card>

    </v-dialog>

    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible2">

      <v-card title="申请已提交">
        <v-container>


          <v-card-item title="类型" :subtitle="p_type ? '赞成' : '反对'">

          </v-card-item>
          <v-card-item title="充值金额">
            <template v-slot:subtitle>
              <Amount :value="publicity._chainpayOrder_value" decimalPlaces="2" currency="CNY" short sub/>
            </template>
          </v-card-item>

          <v-card-item title="交易哈希">
            <template v-slot:subtitle>
              <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
            </template>
          </v-card-item>
          <v-chip variant="text" color="success" size="large">您的申请已提交。</v-chip>
          <v-btn color="primary" block size="large" plain @click="cancel">关闭</v-btn>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*global process*/

import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {mapState} from 'vuex'
import Amount from '../Amount'
import HashLink from '../HashLink'

const ABI_const = require('@/contract/ABI_const.js')
const ethers = require('ethers')
const _addressC = require('@/config/address.json')
import {
  KeyIcon, LockOpenIcon,
  EyeOffIcon,
  EyeIcon
} from '@heroicons/vue/outline'

export default {
  name: 'TrueAndFalsePublicityModal',
  components: {
    Amount,
    HashLink
  },
  props: {
    close: Function,
    publicity: Object,
    visible: Boolean,
    p_type: Boolean
  },
  data() {
    return {
      step: 1,

      password: '',

      submitError: '',
      completedTx: null,

      loading: false,
      loadingText: '',
      localVisible1: false,
      localVisible2: false
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'nextNonce']),
    completedTxShortHash() {
      if (this.completedTx === null) return ''
      return [
        this.completedTx.hash.substring(0, 6),
        this.completedTx.hash.substring(this.completedTx.hash.length - 4)
      ].join('...')
    },
    publicityShortId() {
      if (this.publicity === null) return ''
      return [
        this.publicity.id.substring(0, 6),
        this.publicity.id.substring(this.publicity.id.length - 4)
      ].join('...')
    },
    unlockPeriodInDays() {
      return this.publicity.unlockPeriod / 1000 / 3600 / 24
    },
    unlocksAt() {
      if (this.publicity) return this.completedTx.timestamp + this.publicity.unlockPeriod
      else return null
    },
    unlocksAtDate() {
      const unlockDate = new Date(this.unlocksAt)
      return unlockDate.toLocaleString().split(', ')[0]
    },
    unlocksAtTime() {
      const unlockDate = new Date(this.unlocksAt)
      return unlockDate.toLocaleString().split(', ')[1]
    }
  },
  mounted() {
    this.localVisible1 = this.visible && this.step == 1
  },
  methods: {
    shortHash(hash) {
      if (hash === null) return ''
      return [
        hash.substring(0, 10),
        hash.substring(hash.length - 8)
      ].join('...')
    },
    cancel() {
      this.reset()
      this.close()
    },
    goto(step) {
      this.step = step
    },
    reset() {
      this.goto(1)

      this.password = ''
      this.submitError = ''
      this.completedTx = undefined

    },
    async handlerZf() {
      this.submitError = ''
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // 获取 MetaMask 提供的签名器 (Signer)
      const wallet = provider.getSigner()
      const CtXCTAddress = _addressC['ChainpayClient']

      const contract = new ethers.Contract(
        CtXCTAddress,
        ABI_const['ChainpayClient'].abi,
        provider
      )

      const contractWithSigner = contract.connect(wallet)

      // submit tx to blockchain
      try {

        this.loading = true
        this.loadingText = '提现请求上链中'
        const txGasLimit = await contractWithSigner.callStatic.fulfill(this.publicity.id, this.p_type)
        console.log('gasLimit:', txGasLimit)
        const tx = await contractWithSigner.fulfill(this.publicity.id, this.p_type)

        this.completedTx = {
          hash: tx.hash
        }
        // TODO 这里向支付网关发起提现请求
        setTimeout(() => {
          this.cleanLoad()
          this.goto(2)
        }, 1000)
      } catch (err) {
        this.loading = false
        console.error(err)
        if (err.errorArgs) {
          this.submitError = this.proErrMessage(err.errorArgs[0])
        }
        else {
          this.submitError = err
        }
      }
    },
    proErrMessage(err) {
      switch (err) {
      case 'Source must be the oracle of the request':
        return '当前账户非验证者账户'
      default:
        return err
      }
    },
    cleanLoad() {
      this.loading = false
      this.loadingText = ''
    }
  },

  setup() {
    return {
      LockOpenIcon,
      KeyIcon,
      EyeOffIcon,
      EyeIcon
    }
  },
  watch: {
    visible(newValue, oldv) {
      if (newValue === oldv) return
      this.localVisible1 = newValue && this.step == 1
      this.localVisible2 = newValue && this.step == 2
      if (newValue) {
        this.$store.dispatch('refresh')
      }
    },
    step(newValue, oldv) {
      console.log('watch step', newValue, oldv)
      if (newValue === oldv) return
      this.localVisible1 = this.visible && newValue == 1
      this.localVisible2 = this.visible && newValue == 2
    }
  }
}
</script>

<style scoped>
</style>
