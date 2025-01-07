<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">
    <v-card title="实名绑定">
      <v-card-text>
        <v-list lines="three">
          <v-banner>
            <v-list-item
              title="钱包地址"
              :subtitle="address"
            >
              <template v-slot:append>
                <v-btn v-if="canCopy"
                       @click.prevent="copyToClipboard(address)"
                       :icon="ClipboardCopyIcon" variant="text">
                </v-btn>
              </template>
            </v-list-item>
          </v-banner>

          <v-banner color="warning" :icon="ShieldExclamationIcon" v-if="!privateKey" text="确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了您的详细信息，您
              将无法访问您的钱包。请输入您的密码以确认您有
              备份您的详细信息。">
          </v-banner>


          <v-form validate-on="submit lazy"
                  ref="myForm">


            <el-form>

              <v-text-field
                v-model="mobile"
                :rules="mobileRules"
                autocomplete="off"
                label="你的手机号码*"
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
                  <v-checkbox label="点击进行验证"
                              @change="handleChange" v-model="isVerifys"></v-checkbox>
                </v-col>
                <v-col cols="7">
                  <!--                  TODO-->
                  <v-otp-input
                    v-model="msgCode"
                    variant="filled"
                  ></v-otp-input>
                  <v-text-field
                    v-model="msgCode"
                    :rules="msgCodeRules"
                    autocomplete="off"
                    v-show="false"
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


              <v-text-field
                v-model="realName"
                :rules="realNameRules"
                autocomplete="off"
                label="你的姓名*"
                id="real-name"
                type="text"
                required
                clearable>
              </v-text-field>


              <v-text-field
                v-model="idCard"
                :rules="idCardRules"
                autocomplete="off"
                label="你的证件号码*"
                id="id-card"
                type="text"
                required
                clearable>
              </v-text-field>
              <v-list-item
                title="输入密码以加密此会话"
              >
                <v-text-field
                  :error-messages="passwordError"
                  v-model="password"
                  :rules="passwordRules"
                  autocomplete="off"
                  label="你的密码*"
                  @keypress="createOnEnter"
                  :counter="8"

                  :type="showPassword ? 'text' : 'password'"
                  :prepend-icon="LockOpenIcon"
                  :append-icon="showPassword ? EyeIcon : EyeOffIcon"
                  @click:append="showPassword = !showPassword"
                  required
                  clearable/>

                <small class="text-caption text-medium-emphasis">*表示必填字段</small>
              </v-list-item>
            </el-form>


            <v-list-item>
              <v-row>
                <v-col cols="6">
                  <v-btn v-if="isInIframe() === false" rounded="xl" block size="x-large"
                         variant="tonal" @click="skip">跳过
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn rounded="xl" block size="x-large" @click.prevent="create">下一步</v-btn>
                </v-col>
              </v-row>
            </v-list-item>
          </v-form>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
const EIP712 = require('@/contract/EIP712')
const sigUtil = require('eth-sig-util')
import {queryCert, sendTelCode, userCert} from '@/utils/api'
import * as storage from '@/utils/storage'

import {ClipboardCopyIcon, LockOpenIcon, ShieldExclamationIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'
import {required as _required, helpers} from '@vuelidate/validators'

import VueClicaptcha from 'vue-clicaptcha'
import {mapState} from 'vuex'

const {contract_static_call, contract_gas_call_override, contract_call_override} = require('../../contract/ChainCall')
const ABI_const = require('@/contract/ABI_const.js')
const GlobalConfig = require('@/config/GlobalConfig.json')
const ethers = require('ethers')
const Web3 = require('web3')

const ethUtil = require('ethereumjs-util')
export default {
  name: 'AuthBindModal',
  components: {
    VueClicaptcha
  },
  props: {
    afterAuthBind: Function,
    close: Function,
    visible: Boolean
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
  data() {
    return {
      // src: 'http://127.0.0.1:8000/clicaptcha.php',
      src: 'https://wallet.ctblock.cn/api/clicaptcha.php',
      show: false,
      privateKey: '',
      publicKey: '',
      isVerifys: false,
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
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
      canCopy: !!navigator.clipboard,
      // AUTH
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
      realName: '',
      realNameRules: [
        value => {
          if (value) return true
          return '请输入你的姓名。'
        },
        value => {
          //截取用户提交的用户名的前两字节，也就是姓。
          //截取用户提交的用户名的前两字节，也就是姓。
          const str = value.substr(0, 1)
          const surname = ' 赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤 滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董粱杜阮蓝闵席季麻强贾路娄危江童颜郭 梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗宣丁贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄魏加封芮羿储靳汲邴糜松 井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘姜詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥能苍双 闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍郤璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庚终暨居衡步都耿满弘匡国文寇广禄阙东 殴殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益桓公万俟司马上官欧阳夏侯诸葛闻人东方赫连皇甫尉迟公羊 澹台公冶宗政濮阳淳于仲孙太叔申屠公孙乐正轩辕令狐钟离闾丘长孙慕容鲜于宇文司徒司空亓官司寇仉督子车颛孙端木巫马公西漆雕乐正壤驷公良拓拔夹谷宰父谷粱 晋楚闫法汝鄢涂钦段干百里东郭南门呼延妫海羊舌微生岳帅缑亢况後有琴梁丘左丘东门西门商牟佘佴伯赏南宫墨哈谯笪年爱阳佟第五言福'
          // 查找字符串。
          const r = surname.search(str)
          if (r == -1) {
            return '姓名输入有误,请重新输入!'
          }
          else {
            return true
          }
        }
      ],
      idCard: '',
      idCardRules: [
        value => {
          if (value) return true
          return '请输入你的证件号码。'
        },
        value => {
          //截取用户提交的用户名的前两字节，也就是姓。
          // 只能是18位
          if (!value || value.length != 18) {
            return false
          }

          // 取出本体码
          const idcard_base = value.substr(0, 17)
          // 取出校验码
          const verify_code = value.substr(17, 1)
          // 加权因子
          const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
          // 校验码对应值
          const verify_code_list = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

          // 根据前17位计算校验码
          let total = 0

          for (let i = 0; i < 17; i++) {
            total += idcard_base.substr(i, 1) * factor[i]
          }
          // 取模
          const mod = total % 11
          // 比较校验码
          if (verify_code != verify_code_list[mod]) {
            return '证件号码输入有误,请重新输入!'
          }
          else {
            return true
          }
        }
      ],
      msgCode: '',
      msgCodeRules: [
        value => {
          if (value) return true
          return '请输入验证码。'
        }
      ],
      nextTime: 0,
      hcaptchaResp: null
    }
  },

  validations() {
    return {
      msgCode: [
        helpers.withMessage('请输入验证码', _required)
      ]
    }
  },
  computed: {
    ...mapState(['address'])
  },
  methods: {
    isInIframe() {
      if (window.self !== window.top) {
        console.log('这个网页是在 iframe 中加载的。')
        return true
      }
      else {
        console.log('这个网页不是在 iframe 中加载的。')
        return false
      }
    },

    handleChange() {
      this.show = true
    },
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
    preparAuth() {

      const that = this

      const orderId = new Date().getTime()
      const orderIdEcc = `0x${ethUtil
        .keccak256(Buffer.from(orderId + ''))
        .toString('hex')}`

      const AUTH_CONTROLLER_SYSTEM_ADDRESS = GlobalConfig.AUTH_CONTROLLER_SYSTEM_ADDRESS
      // 判断用户密码是否正确
      // 判断接入方用户名密码

      const c_wallet = new ethers.Wallet(this.privateKey, that.customHttpProvider)
      const contractAddress = GlobalConfig.AUTH_CONTROLLER_ADDRESS_V2
      // TODO 这里新建一张表来存储上链信息 , 这里需要使用到签名
      //等待其它程序处理上链
      const authExpiry = Math.floor(Date.now() / 1000) + 1 * 60 * 60 * 24 * 3600 // 十年
      // 计算签名
      let idHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(this.idCard))
      idHash = idHash.slice(0, 34)
      const auth = {authExpiry, idHash}
      let privateKeyStr = c_wallet.privateKey
      const verifyingContract = contractAddress
      privateKeyStr = ethUtil.stripHexPrefix(privateKeyStr)
      const privateKey = Buffer.from(privateKeyStr, 'hex')

      const Types = {
        Authentication: [
          {type: 'bytes16', name: 'idHash'},
          {type: 'uint256', name: 'orderId'},
          {type: 'address', name: 'caddress'}
        ]
      }

      const data = EIP712.createTypeData(
        {
          name: 'Authentication',
          version: '2',
          chainId: '27',
          verifyingContract
        },
        'Authentication',
        {
          idHash: auth.idHash,
          orderId: orderIdEcc,
          caddress: this.address
        },
        Types
      )

      const signature = sigUtil.signTypedData_v4(privateKey, {data: data})

      const origin_data_json = [auth, orderIdEcc, signature, this.address]
      const preparData = {
        from: AUTH_CONTROLLER_SYSTEM_ADDRESS,
        to: contractAddress,
        status: 0,
        // "hash": "",
        // "block_number": "",
        type: 1,
        is_reback: 0,
        order_id: orderId,
        value: '0',
        // "origin_data": JSON.stringify(origin_data_json),
        origin_data: origin_data_json,
        contract_address: contractAddress,
        method:
          ABI_const['AuthControllerV2'].contractName +
          '#' +
          'authentication'
      }

      return preparData
    },
    cancel() {
      this.reset()
      this.close()
    },
    onVerify(response) {
      // 处理验证响应
      // console.log('hCaptcha verification response:', response)
      this.hcaptchaResp = response
    },
    sendMsgCode() {

      // 调用后台实名
      // 首先查询地址是否已经认证
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      const authContractAddress = GlobalConfig.AUTH_CONTROLLER_ADDRESS_V2
      const address = this.address

      contract_static_call(
        ethers,
        authContractAddress,
        ABI_const['AuthControllerV2'].abi,
        'authsSingle',
        customHttpProvider,
        [address]
      ).then(isAuth => {
        if (isAuth.data == true) {
          this.$message.error('账户已经认证!')
        }
        else {
          // 这里进行验证码验证
          if (this.nextTime != 0) {
            this.$message.error('当前验证码有效!')
          }
          else if (this.hcaptchaResp == null) {
            this.$message.error('请先通过验证')
          }
          else {
            sendTelCode({tel: this.mobile, hcaptcha: this.hcaptchaResp}).then(res => {
              console.log(res)
              if (res.code !== 1) {
                this.$message.error(res.msg)
              }
              else {
                this.$message.success('发送成功!')
                // 开始短信倒计时
                this.nextTime = 60
                this.countTime()

              }
            }).catch((e) => {
              console.trace(e)
              this.$message.error('网络请求失败')
            })
          }
        }
      })
    },
    countTime() {
      this.nextTime = this.nextTime - 1
      if (this.nextTime == 0) {
        return
      }
      window.setTimeout(this.countTime, 1000)
    },
    skip() {
      this.reset()
      this.close()
    },
    async create() {
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      // 判断 如果已经存在第一个钱包, 就进行密码验证
      if (!await this.checkPassword()) return

      const privateKey = await storage.getPrivateKey(this.password)

      // 首先查询地址是否已经认证
      this.privateKey = ethUtil.stripHexPrefix(privateKey)
      const address = this.address

      // 以太币转账
      // 先获取当前账号交易的nonce
      console.log(address)
      queryCert({address: address}).then((res) => {
        console.log(res)
        if (res.code !== 200) {
          this.$message.error(res.msg)
        }
        else {
          if (res.is_cert) {
            this.showCertModal = false
            this.$message.success('账户已经认证!')
            return
          }
          this.sec_data = res.sec_data
          const paramSha3 = Web3.utils.sha3(this.sec_data, {encoding: 'hex'})
          const privateBuffer = Buffer.from(this.privateKey, 'hex')
          // console.log("paramSha3:", paramSha3)
          const ecsign = ethUtil.ecsign(Buffer.from(Web3.utils.hexToBytes(paramSha3)), privateBuffer)
          console.log('R', ethUtil.bufferToHex(ecsign.r))
          console.log('S', ethUtil.bufferToHex(ecsign.s))
          console.log('V', ethUtil.bufferToHex(ecsign.v))
          let sign = ethUtil.bufferToHex(ecsign.r) + ethUtil.bufferToHex(ecsign.s) + ethUtil.bufferToHex(ecsign.v)
          sign = sign.replace(new RegExp('0x', 'gm'), '')
          console.log(sign)

          // 生成上链预实名数据
          const preparData = this.preparAuth()
          console.log('preparData:', preparData)
          userCert({
            cert_name: this.realName,
            cert_id_number: this.idCard,
            mobile: this.mobile,
            sign: sign,
            msg: this.sec_data,
            msg_code: this.msgCode,
            prepar_data: preparData
          }).then((res) => {
            console.log(res)
            if (res.code !== 200) {
              this.$message.error(res.msg)
            }
            else {
              this.is_cert = res.is_cert
              this.sec_data = res.sec_data
              this.$message.success('认证成功!')

              this.reset()
              this.afterAuthBind()
            }
          }).catch(() => {
            this.$message.error('网络请求失败')
          })
        }
      })
    },
    async checkPassword() {
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
      this.mobile = ''
      this.realName = ''
      this.msgCode = ''
      this.idCard = ''
    }
  },
  async mounted() {

  },
  setup() {
    return {
      LockOpenIcon, EyeIcon, EyeOffIcon,
      ClipboardCopyIcon, ShieldExclamationIcon
    }
  }
}
</script>

<style scoped>
</style>
