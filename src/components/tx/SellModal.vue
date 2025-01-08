<template>
  <div>
    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible1">

      <v-card title="提现余额">
        <template v-slot:subtitle>
          <Amount :value="xctBalance" :decimalPlaces="2" currency="RMB"/>
          可用
        </template>

        <v-container>
          <v-list>
            <v-list-item title="选择提现方式">
              <v-radio-group v-model="payType">
                <v-radio :label="`\n${items.card_id}`"
                         v-for="(items,index) in payTypeArr"
                         v-bind:key="index"
                         :value="items">
                  <template v-slot:label>
                    <strong class="text-primary">{{ items.card_name }}</strong>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-list-item>
            <v-list-item>
              <v-form ref="myForm">
                <v-text-field
                  v-model="amount"
                  :rules="amountRules"
                  autocomplete="off"
                  label="数量"
                  type="text"
                  required
                  clearable>
                  <template v-slot:append>
                    RMB
                  </template>

                </v-text-field>
              </v-form>
            </v-list-item>
            <v-list-item title="手续费">
              <template v-slot:subtitle>
                <Amount :value="fee" currency="CT" short sub/>
              </template>
              <template v-slot:prepend>
                <v-tooltip location="top" text="这涵盖了草田链交易的成本">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" :icon="InformationCircleIcon"/>
                  </template>
                </v-tooltip>
              </template>
            </v-list-item>
            <v-list-item>
              <v-row>
                <v-col cols="4">
                  <v-card-item title="您正在提现">
                    <template v-slot:subtitle>
                      您正在提现
                    </template>
                  </v-card-item>
                </v-col>
                <v-col cols="4">
                  <v-row align-content="center" align="center">
                    <v-col cols="4">
                      <v-img :width="40" :height="40"
                             aspect-ratio="16/9" src="/assets/e-logo-alt.svg" alt="CT Wallet"/>
                    </v-col>
                    <v-col cols="4">
                      <v-icon size="large" :icon="ArrowRightIcon"/>
                    </v-col>
                    <v-col cols="4">
                      <v-img :width="40" :height="40"
                             aspect-ratio="16/9" src="/assets/usd-coin-cny-logo.svg" alt="image description"/>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="4">
                  <v-card-item title="您将收到">
                    <template v-slot:subtitle>
                      <Amount :value="usdcAmount" currency="CNY"/>
                    </template>
                  </v-card-item>
                </v-col>
              </v-row>

            </v-list-item>

            <v-list-item v-if="submitError">
              <template v-slot:subtitle>
                发生了错误 ({{ submitError }})。 请再试一次。
              </template>
            </v-list-item>

            <v-list-item>
              <v-row>
                <v-col cols="6">
                  <v-btn size="large" variant="tonal" block @click="cancel">返回</v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn color="primary" size="large" block :disabled="!canReadySell" @click="readySell">提现
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card>


    </v-dialog>

    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible2">

      <v-card title="提现余额">
        <template v-slot:subtitle>
          <Amount :value="xctBalance" currency="RMB" :decimalPlaces="2"/>
          可用
        </template>

        <v-container>
          <v-list>

            <v-list-item title="您正在提现">
              <template v-slot:subtitle>
                <Amount :value="amountParsed" currency="RMB" short sub/>
              </template>
            </v-list-item>

            <v-list-item title="从">
              <template v-slot:subtitle>
                <HashLink to="explorer" :wallet="address"/>
              </template>
            </v-list-item>

            <v-list-item title="到">
              <template v-slot:default>
                <v-row>
                  <v-col cols="auto">
                    <v-list-item variant="tonal" rounded="lg">
                      <div>{{ payType.card_name }}</div>
                      <div>{{ payType.card_id }}</div>
                    </v-list-item>
                  </v-col>
                </v-row>
              </template>
            </v-list-item>
            <v-list-item
              title="手续费"
            >
              <template v-slot:prepend>
                <v-tooltip :text="`这涵盖了草田链交易的成本`" location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" :icon="InformationCircleIcon"/>
                  </template>
                </v-tooltip>
              </template>
              <template v-slot:subtitle>
                <Amount :value="fee" currency="CT" short sub/>
              </template>
            </v-list-item>

            <v-list-item title="您将收到">
              <template v-slot:subtitle>
                <Amount :value="usdcAmount" currency="CNY" sub/>
              </template>
            </v-list-item>
            <v-list-item>
              <small v-if="!withinSaleLimit" class="text-caption text-medium-emphasis"> 价格已更新。交换最大值现在是
                {{ exchangeRate.limit }} RMB.</small>
            </v-list-item>

            <v-list-item v-if="submitError">
              <template v-slot:subtitle>
                发生了错误 ({{ submitError }})。 请再试一次。
              </template>
            </v-list-item>

            <v-list-item>
              <v-row>
                <v-col cols="6">
                  <v-btn variant="tonal" size="large" block @click="() => goto(1)">
                    返回
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn :loading="loading" color="primary" block :disabled="!canSell" size="large"
                         @click="sell">
                    确认
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card>
    </v-dialog>
    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible3">
      <v-card title="提现已接受">

        <v-container>

          <v-list>

            <v-list-item title="您正在提现">
              <template v-slot:subtitle>
                <Amount :value="completedTx.amount" currency="RMB" short sub/>
              </template>
            </v-list-item>

            <v-list-item title="从">
              <template v-slot:subtitle>
                <HashLink to="explorer" :wallet="address"/>
              </template>
            </v-list-item>

            <v-list-item title="到">
              <v-row>
                <v-col cols="auto">
                  <v-list-item variant="tonal" rounded="lg">
                    <div>{{ payType.card_name }}</div>
                    <div>{{ payType.card_id }}</div>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-list-item>

            <v-list-item title="手续费">
              <template v-slot:subtitle>
                <Amount :value="feeOnSubmit" currency="CT" short sub/>
              </template>
            </v-list-item>

            <!--            <v-list-item title="价格">-->
            <!--              <template v-slot:subtitle>-->
            <!--                <Amount :value="exchangeRateOnSubmit" currency="CNY" sub/>-->
            <!--              </template>-->
            <!--            </v-list-item>-->

            <v-list-item title="您将收到">
              <template v-slot:subtitle>
                <Amount :value="usdcAmountOnSubmit" currency="CNY" sub/>
              </template>
            </v-list-item>

            <v-list-item title="交易哈希">
              <template v-slot:subtitle>
                <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
              </template>
            </v-list-item>

            <v-list-item>
              <small
                class="text-caption text-medium-emphasis">您的请求已被接受，应该会尽快处理。如果您的请求因任何原因无法处理，您的余额将被退回。</small>
            </v-list-item>

            <v-list-item>
              <v-btn
                @click="cancel"
                block size="large" color="primary"
              >关闭
              </v-btn>
            </v-list-item>

          </v-list>


        </v-container>

      </v-card>

    </v-dialog>
  </div>
</template>

<script>

import ABI_const from '@/contract/ABI_const'
import {fetchExchangeRates, fetchGasRates} from '@/utils/api'
import {parseAmount} from '@/utils/form'
import * as validation from '@/utils/validation'
import {ArrowRightIcon} from '@heroicons/vue/outline'
import {LockOpenIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'

import {InformationCircleIcon} from '@heroicons/vue/solid'
import useVuelidate from '@vuelidate/core'
import {mapState} from 'vuex'
import {getCardList} from '../../utils/storage'
import Amount from '../Amount'
import HashLink from '../HashLink'

const _addressC = require('@/config/address.json')
const ethers = require('ethers')
const exchangeRateUpdateInterval = 15 * 1000
const gasRatesUpdateInterval = 15 * 1000

export default {
  name: 'SellModal',
  components: {
    Amount,
    HashLink
  },
  props: {
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      step: 1,

      exchangeRate: {},
      gasRates: {},

      amount: '',
      amountRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        },
        value => {

          let _bal
          if (this.localItem == null || this.localItem.type === 'CT') {
            _bal = this.balance
          }
          else {
            _bal = this.localItem.balance
          }

          if (isNaN(parseAmount(value))) {
            return '无效的金额。'
          }
          if (isNaN(_bal)) {
            return '无效的金额。'
          }
          if (_bal <= parseAmount(value)) {
            return '余额不足。'
          }
          return true
        }
      ],

      // TODO 设置为null
      completedTx: null,
      feeOnSubmit: 0,
      submitError: '',
      exchangeRateOnSubmit: 0,
      usdcAmountOnSubmit: 0,
      payType: {},
      payTypeArr: [
        // {name: '建设银行', value: '****5678'},
        // {name: '农业银行', value: '****5679'},
        // {name: '中信银行', value: '****5670'}
      ],
      loading: false,
      loadingText: '',

      localVisible1: false,
      localVisible2: false,
      localVisible3: false
    }
  },
  validations() {
    return {
      amount: [
        validation.required,
        ...validation.amount(this.xctBalance, this.amountParsed)
        // helpers.withParams(
        //   { saleLimit: this.saleLimit },
        //   helpers.withMessage(`The exchange maximum is ${this.saleLimit} CT.`, () => this.withinSaleLimit)
        // )
      ]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'xctBalance']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    canReadySell() {
      return ![this.v$.amount].map(f => f.$invalid).includes(true) && this.usdcAmount > 0
    },
    canSell() {
      return !this.v$.$invalid && this.withinSaleLimit && this.usdcAmount > 0
    },
    saleLimit() {
      return this.exchangeRate.limit || 0
    },
    withinSaleLimit() {
      return this.amountParsed <= this.saleLimit
    },
    rateAge() {
      if (this.exchangeRate.date === undefined) return '...'
      const date = new Date(this.exchangeRate.date)
      const ms = Date.now() - date.getTime()
      const s = Math.floor(ms / 1000)
      const unit = s === 1 ? 'second' : 'seconds'
      return `${s} ${unit} ago`
    },
    minimumFee() {
      if (this.gasRates.minimumHandlingFee === undefined) return NaN
      if (this.exchangeRate.gas === undefined) return NaN
      const {handlingFeePercentage, minimumHandlingFee} = this.gasRates
      const percentageFee = this.amountParsed * (handlingFeePercentage / 100)
      return Math.max(percentageFee, minimumHandlingFee)
    },
    fee() {
      if (this.exchangeRate.gas === undefined) return NaN
      return this.minimumFee + this.exchangeRate.gas
    },
    usdcAmount() {
      return Math.max(0, this.amountParsed - this.fee) * this.exchangeRate.rate
    }
  },
  watch: {
    step(newValue, oldv) {
      console.log('watch step', newValue, oldv)
      if (newValue === oldv) return
      this.localVisible1 = this.visible && newValue == 1
      this.localVisible2 = this.visible && newValue == 2
      this.localVisible3 = this.visible && newValue == 3
    },
    visible(v, oldv) {
      if (v === oldv) return
      this.localVisible1 = v && this.step == 1
      this.localVisible2 = v && this.step == 2
      this.localVisible3 = v && this.step == 3

    }
  },
  async mounted() {
    this.localVisible1 = this.visible && this.step == 1
    const cardList = await getCardList()
    console.log(cardList)
    if (cardList) {
      this.payTypeArr = cardList['card_lists']

      if (this.payTypeArr.length > 0) {
        this.payType = this.payTypeArr[0]
      }
    }
    this.updateExchangeRate()
    this.updateGasRates()
  },
  methods: {

    setStakeType(type) {
      this.payType = type
    },
    cancel() {
      this.reset()
      this.close()
    },
    goto(step) {
      this.step = step
    },
    async readySell() {
      // validate only step 1
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      this.goto(2)
    },
    reset() {
      this.goto(1)

      this.amount = ''

      this.completedTx = null
      this.feeOnSubmit = 0
      this.exchangeRateOnSubmit = 0
      this.usdcAmountOnSubmit = 0

      this.v$.$reset()
    },
    async sell() {

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // 获取 MetaMask 提供的签名器 (Signer)
      const wallet = provider.getSigner()

      const CtXCTAddress = _addressC['XCT']

      const contract = new ethers.Contract(
        CtXCTAddress,
        ABI_const['XCT'].abi,
        provider
      )

      const contractWithSigner = contract.connect(wallet)

      const value = this.amountParsed * 100

      // submit tx to blockchain
      try {
        this.loading = true
        this.loadingText = '提现请求上链中'
        const tx = await contractWithSigner.redeem(value, 1)
        // const { metadata, results } = await xe.tx.createTransactions(process.env.VUE_APP_BLOCKCHAIN_API_URL, [tx])
        // if (metadata.accepted) {
        //   this.completedTx = results[0]
        //   this.feeOnSubmit = this.fee
        //   this.exchangeRateOnSubmit = this.exchangeRate.rate
        //   this.usdcAmountOnSubmit = this.usdcAmount
        //   this.goto(3)
        // }
        // else {
        //   this.submitError = results[0].reason
        // }
        this.completedTx = {
          amount: this.amount,
          hash: tx.hash
        }
        this.feeOnSubmit = this.fee
        this.exchangeRateOnSubmit = this.exchangeRate.rate
        this.usdcAmountOnSubmit = this.usdcAmount
        // TODO 这里向支付网关发起提现请求
        setTimeout(() => {
          this.cleanLoad()
          this.goto(3)
        }, 1000)
      } catch (err) {
        this.loading = false
        console.error(err)
        this.submitError = err.message
      }
    },
    cleanLoad() {
      this.loading = false
      this.loadingText = ''
    },
    sellOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.sell()
    },
    async updateExchangeRate() {
      this.exchangeRate = await fetchExchangeRates()
    },
    async updateGasRates() {
      this.gasRates = await fetchGasRates()
    }
  },
  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon,
      ArrowRightIcon,
      InformationCircleIcon, EyeIcon, EyeOffIcon
    }
  }
}
</script>

<style scoped>
</style>
