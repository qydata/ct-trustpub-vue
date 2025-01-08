<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="close"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card>

      <template v-slot:title>

        <div v-if="step === stepThree">
          充值声明
        </div>
        <div v-else-if="step === stepOne">
          充值余额
        </div>
        <div v-else-if="step === stepTwo">
          充值余额
        </div>
        <div v-else-if="step === stepFour">
          充值已接受
        </div>
      </template>
      <template v-slot:subtitle>
        <div v-if="step === stepThree">
          <Amount :value="xctBalance" :decimalPlaces="2" currency="RMB"/>
          可用
        </div>
        <div v-else-if="step === stepOne">
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="xctBalance" :decimalPlaces="2" currency="RMB"/> 可用
        </span>

        </div>
        <div v-else-if="step === stepTwo">
          <Amount :value="xctBalance" currency="RMB" :decimalPlaces="2"/>
          可用
        </div>
        <div v-else-if="step === stepFour"></div>

        <v-stepper
          :items="['充值', '扣款','声明',  '充值已接受']"
          v-model="step"
          alt-labels
          hide-actions
        >

          <v-list v-if="step === stepThree" v-loading="loading" :element-loading-text="loadingText">
            <v-list-item>
              <v-row>
                <!-- eslint-disable-next-line max-len -->
                <v-col cols="6">
                  <v-btn color="primary" variant="tonal" size="large" block :disabled="loading"
                         @click="() => goto(stepOne)">返回
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn color="primary" block :disabled="!canBuy" size="large" :loading="loading" @click="Declare">
                    确认
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>
            <v-list-item v-if="submitError">
              <template v-slot:subtitle>
                发生了错误 ({{ submitError }})。 请再试一次。
              </template>
            </v-list-item>
          </v-list>
          <v-list v-else-if="step === stepOne" lines="six">

            <v-list-item>
              <v-form ref="myForm1">
                <v-list-item
                >
                  <v-text-field
                    v-model="recipient"
                    readonly
                    :rules="recipientRules"
                    autocomplete="off"
                    label="充值至*"
                    type="text"
                    required
                  />
                </v-list-item>
                <v-list-item
                >
                  <v-text-field
                    v-model="amount"
                    :rules="amountRules"
                    autocomplete="off"
                    label="数量"
                    type="text"
                    required
                    clearable>
                    <template v-slot:append>
                      rmb
                    </template>

                  </v-text-field>
                </v-list-item>

              </v-form>

            </v-list-item>
            <v-list-item
              title="手续费"
            >
              <template v-slot:prepend>
                <v-tooltip :text="`包含 ${minimumFee} rmb手续费`" location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" :icon="InformationCircleIcon"/>
                  </template>
                </v-tooltip>
              </template>
              <template v-slot:subtitle>
                <Amount :value="fee" currency="rmb" short sub/>
              </template>
            </v-list-item>

            <v-list-item>
              <v-row justify="center" align="center">
                <v-col cols="4">
                  <v-img
                    height="40" width="40"
                    src="/assets/usd-coin-cny-logo.svg"
                    alt="CT Wallet"/>
                  您正在充值
                  <br/>
                  <Amount :value="amountParsed" currency="CNY" short/>
                </v-col>
                <v-col cols="4" class="text-center">
                  <v-icon size="x-large" :icon="ArrowRightIcon"/>
                </v-col>
                <v-col cols="4" align="right">
                  <v-img
                    :width="60" :height="40" src="/assets/e-logo-alt.svg" alt="image description "/>
                  您将收到
                  <br/>
                  <Amount :value="edgeAmount" currency="RMB"/>
                </v-col>
              </v-row>
            </v-list-item>
            <v-list-item/>
            <v-list-item>
              <v-row>
                <v-col cols="6">
                  <v-btn variant="tonal" size="large" block @click="cancel">返回</v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn
                    @click="readyWithdraw" size="large"
                    color="primary" block
                  >充值
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>

          </v-list>
          <v-list v-else-if="step === stepTwo" v-loading="loading" :element-loading-text="loadingText">
            <v-list-item title="您正在充值">
              <template v-slot:subtitle>
                <Amount :value="amount" currency="CNY" sub/>
              </template>
            </v-list-item>
            <v-list-item
              title="选择支付方式">
              <v-radio-group v-model="payType">
                <v-radio :label="`\n${items.card_id}`"
                         v-for="(items,index) in payTypeArr"
                         v-bind:key="index"
                         :value="items">
                  <template v-slot:label>
                    <strong class="text-primary">{{ items.card_name }}</strong>
                  </template>
                </v-radio>
                <!--              <v-radio label="Radio Two" value="two"></v-radio>-->
                <!--              <v-radio label="Radio Three" value="three"></v-radio>-->
              </v-radio-group>
            </v-list-item>
            <v-list-item title="从">
              <v-row>
                <v-col cols="auto">
                  <v-list-item variant="tonal" rounded="lg">
                    <div>{{ payType.card_name }}</div>
                    <div>{{ payType.card_id }}</div>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-list-item>
            <v-list-item title="To">
              <template v-slot:subtitle>
                <HashLink to="etherscan" :wallet="recipient"/>
              </template>
            </v-list-item>
            <v-list-item
              title="手续费"
            >
              <template v-slot:prepend>
                <v-tooltip :text="`包括 ${minimumFee} rmb 的手续费`" location="right">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" :icon="InformationCircleIcon"/>
                  </template>
                </v-tooltip>
              </template>
              <template v-slot:subtitle>
                <Amount :value="fee" currency="rmb" short sub/>
              </template>
            </v-list-item>
            <v-list-item
              title="您将收到"
            >
              <template v-slot:prepend>
                <v-tooltip text="您可能会收到这些" location="right">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" :icon="InformationCircleIcon"/>
                  </template>
                </v-tooltip>
              </template>
              <template v-slot:subtitle>
                <Amount :value="edgeAmount" currency="RMB" sub/>
              </template>
            </v-list-item>
            <v-list-item/>
            <v-list-item>
              <v-form ref="myForm2">
                <v-text-field
                  v-model="mobile"
                  :rules="mobileRules"
                  autocomplete="off"
                  label="请输入你的手机号码"
                  id="tel-number"
                  type="text"
                  required
                  clearable>
                  <template v-slot:append>
                    <v-btn size="large" @click.prevent="sendMsgCode">
                      {{ nextTime == 0 ? '获取验证码' : nextTime + '秒' }}
                    </v-btn>
                  </template>
                </v-text-field>

                <v-row>
                  <v-col cols="5">
                    <v-checkbox label="点击验证"
                                @change="handleChange" v-model="isVerifys"/>
                  </v-col>
                  <v-col cols="7">

                    <v-otp-input
                      v-model="msgCode"
                      variant="filled"
                    ></v-otp-input>
                    <v-text-field
                      v-model="msgCode"
                      :rules="msgCodeRules"
                      v-show="false"
                      autocomplete="off"
                      label="输入验证码"
                      :readonly="loading"
                      type="text"
                      required
                      clearable>
                    </v-text-field>

                  </v-col>

                  <v-list-item v-if="submitError">
                    <template v-slot:subtitle>
                      发生了错误 ({{ submitError }})。 请再试一次。
                    </template>
                  </v-list-item>

                  <!--              <VueHcaptcha theme="dark"-->
                  <!--                           sitekey="a0bce798-5c05-4ab9-96ae-d15863e4e5fa"-->
                  <!--                           @verify="onVerify"></VueHcaptcha>-->


                </v-row>
              </v-form>
            </v-list-item>
            <v-list-item>
              <v-row align="center" justify="center">
                <v-col cols="6">
                  <v-btn variant="tonal" size="large" block :disabled="loading" @click="() => goto(stepOne)">返回
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn size="large" color="primary" block :loading="loading" @click="Chargebacks">确认</v-btn>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
          <v-list v-else-if="step === stepFour">

            <v-list-item title="您正在充值">
              <template v-slot:subtitle>
                <Amount :value="completedTx.amount" currency="CNY" short sub/>
              </template>
            </v-list-item>

            <v-list-item title="从">
              <v-row>
                <v-col cols="auto">
                  <v-list-item variant="tonal" rounded="lg">
                    <div>{{ payType.card_name }}</div>
                    <div>{{ payType.card_id }}</div>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-list-item>

            <v-list-item title="到">
              <template v-slot:subtitle>
                <HashLink to="etherscan" :wallet="completedTx.data.destination"/>
              </template>
            </v-list-item>

            <v-list-item title="手续费">
              <template v-slot:subtitle>
                <Amount :value="feeOnSubmit" currency="CT" short sub/>
              </template>
            </v-list-item>

            <v-list-item title="您将收到">
              <template v-slot:subtitle>
                <Amount :value="edgeAmount" currency="RMB" sub/>
              </template>
            </v-list-item>

            <v-list-item title="交易哈希">
              <template v-slot:subtitle>
                <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
              </template>
            </v-list-item>
            <v-list-item>
              <small class="text-caption text-medium-emphasis">您的请求已被接受，应该很快被处理。</small>
            </v-list-item>
            <v-btn block color="primary" size="large" @click="cancel">关闭
            </v-btn>
          </v-list>
        </v-stepper>
      </template>
    </v-card>
    <VueClicaptcha
      v-if="show" :callback="callback" :src="src"/>
  </v-dialog>
</template>
<script>

import {fetchGasRates} from '@/utils/api'
import {parseAmount} from '@/utils/form'
import {ArrowRightIcon} from '@heroicons/vue/outline'
import {LockOpenIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'
import VueClicaptcha from 'vue-clicaptcha'
import useVuelidate from '@vuelidate/core'
import {required as _required, helpers} from '@vuelidate/validators'
import {mapState} from 'vuex'
import {getCardList} from '../../utils/storage'
import Amount from '../Amount'
import HashLink from '../HashLink'
import {InformationCircleIcon} from '@heroicons/vue/solid'

const ABI_const = require('@/contract/ABI_const.js')
const _addressC = require('@/config/address.json')
const ethers = require('ethers')
const ethUtil = require('ethereumjs-util')

export default {
  name: 'WithdrawModal',
  components: {
    Amount,
    HashLink,
    VueClicaptcha
  },
  props: {
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      step: 1,
      stepOne: 1,
      stepTwo: 2,
      stepThree: 3,
      stepFour: 4,

      localVisible: this.visible,
      gasRates: {},

      recipient: '',
      recipientRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        },
        value => {
          const ctAddressRegexp = /^0x[a-fA-F0-9]{40}$/
          /**
           * CT address validator.
           */
          let ret = ctAddressRegexp.test(value)
          if (ret) return true
          return '无效的草田链地址.'
        }],
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

      submitError: '',
      // TODO 这里需要设置为{}
      completedTx: {},
      edgeAmountOnSubmit: 0,
      feeOnSubmit: 0,
      payType: {},
      payTypeArr: [
        // {name: '建设银行', value: '****5678'},
        // {name: '农业银行', value: '****5679'},
        // {name: '中信银行', value: '****5670'}
      ],
      msgCode: '',
      msgCodeRules: [
        value => {
          if (value) return true
          return '请输入验证码。'
        }
      ],
      nextTime: 0,
      mobile: '',
      mobileRules: [
        value => {
          if (value) return true
          return '请输入你的手机号码。'
        },
        value => {
          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
          let _reg = phoneReg.test(value)
          if (_reg) return true
          return '手机号码输入有误,请重新输入!'
        }
      ],
      isVerifys: false,
      show: false,
      src: 'https://wallet.ctblock.cn/api/clicaptcha.php',
      loading: false,
      loadingText: ''
    }
  },
  validations() {
    return {
      msgCode: [
        helpers.withMessage('请输入验证码', _required),
        helpers.withMessage('验证码输入有误,请重新输入!', v => {

          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^\d{4}$/
          return phoneReg.test(v)
        })
      ],
      isVerifys: [
        helpers.withMessage('请验证!', v => v == true)
      ]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'xctBalance']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    canBuy() {
      return this.edgeAmount > 0
    },
    gasRate() {
      return this.gasRates.fee
    },
    minimumFee() {
      if (this.gasRate === undefined || isNaN(this.amountParsed)) return NaN
      const {handlingFeePercentage, minimumHandlingFee} = this.gasRates
      const percentageFee = this.amountParsed * (handlingFeePercentage / 100)
      return Math.max(percentageFee, minimumHandlingFee)
    },
    fee() {
      if (this.gasRate === undefined || isNaN(this.amountParsed)) return NaN
      return this.minimumFee + this.gasRate
    },
    edgeAmount() {
      return Math.max(0, this.amountParsed - this.fee)
    }
  },
  watch: {
    payType(v, oldv) {
      this.mobile = v.mobile
    },
    async visible(v, oldv) {
      if (v === oldv) return
    }
  },
  async mounted() {
    this.recipient = this.address
    const cardList = await getCardList()
    console.log(cardList)
    if (cardList) {
      this.payTypeArr = cardList['card_lists']
      this.payType = this.payTypeArr[0]
      this.mobile = this.payType.mobile
    }
    this.updateGasRates()
  },
  methods: {
    callback(val) {
      console.log(val)
      if (val.status == true) {
        this.show = false
        this.isVerifys = true
        this.hcaptchaResp = val
      }
      else {
        this.isVerifys = false
      }
    },
    handleChange() {
      this.show = true
    },
    sendMsgCode() {

      // 这里进行验证码验证
      if (this.nextTime != 0) {
        this.$message.error('当前验证码有效!')
      }
      else if (this.hcaptchaResp == null) {
        this.$message.error('请先通过验证')
      }
      else {
        this.$message.success('发送成功!')
        // 开始短信倒计时
        this.nextTime = 60
        this.countTime()
        // sendTelCode({tel: this.mobile, hcaptcha: this.hcaptchaResp}).then(res => {
        //   console.log(res)
        //   if (res.code !== 2) {
        //     this.$message.error(res.msg)
        //   }
        //   else {
        //     this.$message.success('发送成功!')
        //     // 开始短信倒计时
        //     this.nextTime = 60
        //     this.countTime()
        //
        //   }
        // }).catch((e) => {
        //   console.trace(e)
        //   this.$message.error('网络请求失败')
        // })
      }
    },
    countTime() {
      this.nextTime = this.nextTime - 1
      if (this.nextTime == 0) {
        return
      }
      window.setTimeout(this.countTime, 1000)
    },
    cancel() {
      this.reset()
      this.close()
    },

    goto(step) {
      if (step == this.stepTwo) {
        this.loading = false
        this.loadingText = ''
      }
      this.step = step
    },
    async readyWithdraw() {
      const {valid, errors} = await this.$refs.myForm1.validate()
      if (!valid) return
      // validate only step this.stepTwo

      if (this.payTypeArr.length == 0) {
        this.$message.error('暂无支付方式,请先在我的支付中添加')
        return
      }

      this.goto(this.stepTwo)
    },
    reset() {
      this.goto(this.stepOne)

      this.amount = ''
      this.amount = ''
      this.msgCode = ''
      this.submitError = ''
      this.completedTx = null
      this.edgeAmountOnSubmit = 0
      this.feeOnSubmit = 0
      this.mobile = ''
    },
    async updateGasRates() {
      this.gasRates = await fetchGasRates()
    },
    // 扣款
    async Chargebacks() {

      const {valid, errors} = await this.$refs.myForm2.validate()
      if (!valid) return
      this.loading = true
      this.$message.success('请求银行网关支付中')
      // TODO 请求银行网关支付 这里需要后台验证验证码还有其他的
      setTimeout(() => {
        this.goto(this.stepThree)
        this.cleanLoad()
      }, 2000)
    },
    cleanLoad() {
      this.loading = false
      this.loadingText = ''
    },
    // 声明
    async Declare() {

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // 获取 MetaMask 提供的签名器 (Signer)
        const wallet = provider.getSigner()

        const contract = new ethers.Contract(
          _addressC['ChainpayClient'],
          ABI_const['ChainpayClient'].abi,
          provider
        )
        const contractWithSigner = contract.connect(wallet)

        const orderId = `0x${ethUtil
          .keccak256(Buffer.from(new Date().getTime().toString()))
          .toString('hex')}`

        this.loading = true
        this.loadingText = '声明上链中'

        // submit tx to blockchain
        const txGasLimit = await contractWithSigner.callStatic.requestDataFromChainpay(orderId, this.amount)
        console.log('gasLimit', txGasLimit)
        const tx = await contractWithSigner.requestDataFromChainpay(orderId, this.amount)
        await tx.wait()
        console.log(tx.hash)

        this.completedTx = {
          amount: this.amount,
          hash: tx.hash,
          data: {
            destination: this.recipient,
            memo: 'CT Withdrawal',
            ref: this.gasRates.ref,
            token: 'RMB'
          }
        }
        this.goto(this.stepFour)
        this.cleanLoad()
      } catch (err) {
        console.error(err)
        if (err.errorArgs) {
          this.submitError = this.proErrMessage(err.errorArgs[0])
        }
        else {
          this.submitError = err
        }
        this.cleanLoad()
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
    withdrawOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.buy()
    }
  },
  setup() {
    return {
      v$: useVuelidate(),
      ArrowRightIcon,
      LockOpenIcon,
      InformationCircleIcon,
      EyeIcon, EyeOffIcon
    }
  }
}
</script>

<style scoped>
</style>
