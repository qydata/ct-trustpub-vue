<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card title="充值">
      <v-card-text>

        <v-banner color="warning" :icon="ShieldExclamationIcon" text="确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了您的详细信息，您
              将无法访问您的钱包。请输入您的密码以确认您有
              备份您的详细信息。">
        </v-banner>
        <v-form ref="myForm">
          <v-card-item title="充值至地址:">
            <v-text-field
              v-model="toaddress"
              :rules="toaddressRules"
              autocomplete="off"
              label="请输入地址*"
              type="text"
              required
              clearable/>

          </v-card-item>
          <v-card-item title="充值金额:">
            <v-text-field
              v-model="tovalue"
              :rules="tovalueRules"
              autocomplete="off"
              label="请填写充值金额*"
              type="text"
              required
              clearable/>

          </v-card-item>
          <v-card-item>
            <template v-slot:title>
              <v-tooltip location="top" :text="`最后更新 ${timeSince(new Date().getTime())}`">
                <template v-slot:activator="{ isActive,props }">
                  <v-icon :icon="InformationCircleIcon" v-bind="props"></v-icon>
                </template>
              </v-tooltip>
              价格
            </template>
            <template v-slot:subtitle>
              1 rmb = {{ exchangeRate }} 草田分
            </template>
          </v-card-item>
          <v-card-item></v-card-item>
          <v-card-item></v-card-item>
        </v-form>
        <v-row>

          <v-col cols="4">
            <v-card-item title="您正在充值">
              <template v-slot:subtitle>
                <Amount :value="Number(tovalue)" currency="CNY" :decimalPlaces="2"/>
              </template>
            </v-card-item>
          </v-col>
          <v-col cols="4">
            <v-row align-content="center" align="center">
              <v-col cols="4">
                <v-img :width="40" :height="40"
                       aspect-ratio="16/9" src="/assets/usd-coin-cny-logo.svg" alt="CT Wallet"/>
              </v-col>
              <v-col cols="4">
                <v-icon size="x-large" :icon="ArrowRightIcon"/>
              </v-col>
              <v-col cols="4">
                <v-img :width="40" :height="40"
                       aspect-ratio="16/9" src="/assets/logo.svg" alt="image description"/>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4">
            <v-card-item title="您将收到">
              <template v-slot:subtitle>
                <Amount :value="Number(tovalue)*exchangeRate" currency="草田分"/>
              </template>
            </v-card-item>
          </v-col>

        </v-row>
        <v-list-item>
          <v-row>
            <v-col cols="6">

              <v-btn
                rounded="xl" block size="x-large"
                variant="tonal"
                @click="skip"
              >
                {{
                  // label == 'header' ? '跳过' : '关闭'
                  label == 'accountPanel' ? '关闭' : '跳过'
                }}
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn rounded="xl" block size="x-large" :loading="isNextLoading" @click="create">下一步</v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script>
import Amount from '@/components/Amount.vue'
import {putChangeReq, queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import {ShieldExclamationIcon} from '@heroicons/vue/outline'
import {mapState} from 'vuex'
import {InformationCircleIcon} from '@heroicons/vue/solid'
import moment from 'moment'
import {ArrowRightIcon} from '@heroicons/vue/outline'

export default {
  name: 'AuthBindModal',
  components: {
    Amount
  },
  props: {
    afterCharge: Function,
    close: Function,
    visible: Boolean,
    label: String
  },
  computed: {
    ...mapState(['address'])
  },
  data() {
    return {
      privateKey: '',
      publicKey: '',
      exchangeRate: 10,
      toaddress: '',
      toaddressRules: [value => {
        if (value) return true
        return '请输入地址。'
      }, value => {
        const regex = /^(0x[0-9a-fA-F]{40})$/
        if (value === '' || !regex.test(value)) {
          return '输入的地址无效,请核对后重新输入!'
        }
        else {
          return true
        }
      }],
      tovalue: '',
      tovalueRules: [value => {
        if (value) return true
        return '请填写充值金额。'
      }],
      isNextLoading: false,
      canCopy: !!navigator.clipboard,

      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
      isMobile: false
    }
  },

  validations() {
    return {}
  },

  watch: {
    address(newVal, oldVal) {
      this.toaddress = this.address
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
    }
  },
  async mounted() {
    // 检测是否为移动端
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

    this.toaddress = await storage.getAddress(storage.getHighestWalletVersion())
  },
  methods: {
    timeSince(ts) {
      return moment(ts).fromNow()
    },
    cancel() {
      this.reset()
      this.close()
    },
    skip() {
      if (this.label == 'accountPanel') {
        this.cancel()
      }
      else {
        this.reset()
        this.afterCharge()
      }
    },
    async create() {
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      this.address = await storage.getAddress(storage.getHighestWalletVersion())
      // 判断实名情况
      this.isNextLoading = true
      queryCert({address: this.address}).then((res) => {
        if (res.code !== 200) {
          this.$message.error(res.msg)
        }
        else if (res.is_cert) {
          // this.$message.success('账户已经认证!')

          const data = {
            charge_amount: this.tovalue,
            address: this.toaddress,
            // TODO 这里需要等待微信测试通过后才可以测试
            // pc, h5
            type: this.isMobile ? 'h5' : 'pc'
          }
          putChangeReq(data).then((res) => {
            if (res.code !== 200) {
              this.$message.error(res.msg)
            }
            else {
              console.log(res)
              this.payCodeDialog = true
              this.order_id = res.order_id
              this.reset()
              this.afterCharge(res)
            }
          })
        }
        else {
          this.$message.success('账户未认证!')
        }
      })
        .catch(() => {
          this.$message.error('网络请求失败')
        }).finally(() => {
        this.isNextLoading = false
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

    reset() {
    }
  },

  setup() {
    return {
      ShieldExclamationIcon, InformationCircleIcon, ArrowRightIcon
    }
  }
}
</script>

<style scoped>
</style>
