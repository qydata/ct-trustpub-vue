<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card title="添加支付方式">
      <v-card-text>
        <v-list lines="three">
          <v-banner color="warning" :icon="ShieldExclamationIcon"
                    text="所有填写的信息都经过加密和签名，只有您自己可以访问和查看。">
          </v-banner>
          <v-list-item
            title="选择支付方式">
            <v-radio-group v-model="payType">
              <v-radio :label="`\n${items.value}`"
                       v-for="(items,index) in payTypeArr"
                       v-bind:key="index"
                       :value="items">
                <template v-slot:label>
                  <strong class="text-primary">{{ items.name }}</strong>
                </template>
              </v-radio>
              <!--              <v-radio label="Radio Two" value="two"></v-radio>-->
              <!--              <v-radio label="Radio Three" value="three"></v-radio>-->
            </v-radio-group>
          </v-list-item>

          <v-form ref="myForm">
            <v-list-item title="卡类型:">
              <v-select
                item-title="name"
                :hint="cardType?.name +' '+ cardType?.type"
                :items="cardTypes"
                v-model="cardType"
                return-object
                variant="solo-filled"
              ></v-select>
            </v-list-item>

            <v-list-item title="">
              <v-text-field
                v-model="card_id"
                :rules="card_idRules"
                autocomplete="off"
                label="银行卡号*"
                id="charge-amount"
                type="text"
                required
                clearable>
              </v-text-field>
            </v-list-item>


            <v-list-item>
              <v-text-field
                v-model="mobile"
                :rules="mobileRules"
                autocomplete="off"
                label="手机号码*"
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
            </v-list-item>

            <v-row justify="center" align="center">
              <v-col cols="5">
                <v-checkbox label="点击进行验证" :rules="isVerifysRules"
                            @change="handleChange" v-model="isVerifys"></v-checkbox>
              </v-col>
              <v-col cols="7">
                <v-otp-input
                  v-model="msg_code"
                  variant="filled" :rules="msgCodeRules"
                  label="你的验证码*"
                  required
                  clearable/>
                <v-text-field
                  v-model="msg_code"
                  v-show="false"
                  :rules="msgCodeRules"
                  autocomplete="off"
                  label="你的验证码*"
                  id="very-code"
                  type="text"
                  required
                  clearable>
                </v-text-field>
              </v-col>

            </v-row>

            <VueClicaptcha
              v-if="show" :callback="callback" :src="src"/>
          </v-form>


          <v-list-item>
            <v-row>
              <v-col cols="6">
                <v-btn rounded="xl" block size="x-large"
                       variant="tonal" @click="skip">关闭
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn rounded="xl" block size="x-large"
                       @click="addPayNext">添加
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

  </v-dialog>
</template>

<script>
import moment from 'moment'
import VueClicaptcha from 'vue-clicaptcha'
import {mapState} from 'vuex'
import {fetchCardlist, postBindcard} from '../../utils/api'
import {setCardList} from '../../utils/storage'

const ethers = require('ethers')
import {LockOpenIcon, ShieldExclamationIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'

export default {
  name: 'AuthBindModal',
  components: {
    VueClicaptcha
  },
  props: {
    afterCharge: Function,
    close: Function,
    visible: Boolean,
    label: String
  },
  computed: {
    ...mapState({
      address: 'address',
      walletVersion: 'version'
    })
  },
  data() {
    return {
      privateKey: '',
      publicKey: '',
      exchangeRate: 10,
      mobile: '',
      mobileRules: [
        value => {
          if (value) return true
          return '请输入你的银行预留手机号码。'
        },
        value => {
          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
          let _reg = phoneReg.test(value)
          if (_reg) return true
          return '银行预留手机号码输入有误,请重新输入!'
        }
      ],
      card_id: '',
      card_idRules: [
        value => {
          if (value) return true
          return '请填写银行卡号'
        },
        value => {
          //截取用户提交的用户名的前两字节，也就是姓。
          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^\d{16,19}$/
          let _reg = phoneReg.test(value)
          if (_reg) return true
          return '银行卡号输入有误,请重新输入!'
        }
      ],
      passwordError: [],
      msg_code: '',
      msgCodeRules: [
        value => {
          if (value) return true
          return '请输入验证码。'
        }
      ],
      canCopy: !!navigator.clipboard,
      payType: '',
      payTypeArr: [
        // {name: '微信', value: 'wepay'},
        // {name: '支付宝', value: 'alipay'},
        {name: '银行卡', value: 'paycard'}
      ],
      coutry: '',
      coutrys: [
        // {name: '微信', value: 'wepay'},
        // {name: '支付宝', value: 'alipay'},
        {name: '中国', value: 'china'}
      ],
      cardType: {name: '建设银行', type: '储蓄卡', value: 'jsback_save'},
      cardTypes: [
        {name: '建设银行', type: '储蓄卡', value: 'jsback_save'},
        {name: '建设银行', type: '信用卡', value: 'jsback_cred'}
      ],
      isVerifys: false,
      isVerifysRules: [
        value => {
          if (value) return true
          return '请验证!'
        }
      ],
      show: false,
      src: 'https://wallet.ctblock.cn/api/clicaptcha.php',
      nextTime: 0,
      hcaptchaResp: null,

      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible
    }
  },

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

  async mounted() {
    this.$nextTick(() => {
      console.log(this.$el) // 确保在组件挂载后访问
    })
    this.cardType = this.cardTypes[0]
    this.payType = this.payTypeArr[0]
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
        //   if (res.code !== 1) {
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
    setPayType(type) {
      this.payType = type
    },
    timeSince(ts) {
      return moment(ts).fromNow()
    },
    cancel() {
      this.close()
    },
    skip() {
      if (this.label == 'accountPanel') {
        this.cancel()
      }
      else {
        this.afterCharge()
      }
    },
    async addPayNext() {
      // TODO 这里逻辑暂时需要实现

      this.passwordError = []
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // 获取 MetaMask 提供的签名器 (Signer)
      const signer = provider.getSigner()
      const currentTime = Math.floor(Date.now()).toString() // 获取当前时间戳并转换为字符串
      // 使用钱包签名时间戳
      const signature = await signer.signMessage(currentTime)

      // 验证签名
      const recoveredAddress = ethers.utils.verifyMessage(currentTime, signature)

      postBindcard({
        signature: signature,
        timestamp: currentTime,
        other: {
          msgcode: this.msg_code,
          hcaptchaResp: this.hcaptchaResp
          // hcaptchaResp: {
          //   'info': '95,44-204,84-174,41-56,61;319;200',
          //   'status': true,
          //   'src': 'https://wallet.ctblock.cn/api/clicaptcha.php'
          // }
        },
        // 这里用来存储验证码信息, 包括验证码, 滑块, 等信息
        address: this.address,
        // 这个参数没有用
        mobile: this.mobile,
        card_id: this.card_id,
        card_type: this.cardType.type,
        card_name: this.cardType.name
      }).then(async r => {
        if (r.code == 0) {
          this.$message.success(r.message)

          // TODO 获取支付信息
          const cardList = await fetchCardlist({
            signature: signature,
            timestamp: currentTime
          })
          // console.log('cardList:', cardList)
          setCardList(wallet.address, cardList).then(() => {
            console.log('Object stored successfully!')
            this.afterCharge()
          }).catch(err => {
            console.error('Failed to store object:', err)
          })
        }
        else {
          this.$message.error(r.message)
        }
      }).catch(r => {
        console.log('catch:', r)
      })
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

  },

  setup() {
    return {
      LockOpenIcon, ShieldExclamationIcon, EyeIcon, EyeOffIcon
    }
  }
}
</script>

<style scoped>
</style>
