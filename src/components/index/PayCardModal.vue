<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card title="我的支付方式">
      <v-card-text>
        <v-list lines="six">
          <v-banner color="warning" :icon="ShieldExclamationIcon"
                    text="所有填写的信息都经过加密和签名，只有您自己可以访问和查看。">
          </v-banner>

          <v-list-item
            title="我的支付方式">
            <v-container>
              <v-radio-group v-model="payType">
                <v-radio :label="`\n${items.value}`"
                         v-for="(items,index) in cardTypeArr"
                         v-bind:key="index"
                         :value="items">
                  <template v-slot:label>
                    <v-card variant="tonal">
                      <template v-slot:subtitle>
                        {{ items.card_name }} ({{ items.card_type }})
                      </template>
                      <v-card-item :subtitle="items.card_id">
                      </v-card-item>
                    </v-card>
                  </template>
                </v-radio>
                <!--              <v-radio label="Radio Two" value="two"></v-radio>-->
                <!--              <v-radio label="Radio Three" value="three"></v-radio>-->
              </v-radio-group>
            </v-container>

            <v-chip variant="text" color="red" v-if="cardTypeArr.length == 0">
              暂无银行卡支付数据,请点击进行添加
            </v-chip>
          </v-list-item>

          <v-list-item>
            <v-row>
              <v-col cols="6">
                <v-btn @click="skip"
                       rounded="xl" block size="x-large"
                       variant="tonal">关闭
                </v-btn>
                <!-- eslint-disable-next-line max-len -->

              </v-col>
              <v-col cols="6">
                <v-btn
                  rounded="xl" block size="x-large"
                  @click="addPay">添加支付方式
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
import * as storage from '@/utils/storage'
import {InfoFilled} from '@element-plus/icons-vue'
import {ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {required as _required, helpers} from '@vuelidate/validators'
import moment from 'moment'
import {mapState} from 'vuex'
import {getCardList} from '../../utils/storage'

export default {
  name: 'AuthBindModal',
  components: {
    InfoFilled
  },
  props: {
    afterCharge: Function,
    close: Function,
    showAddPay: Function,
    visible: Boolean,
    label: String
  },
  computed: {
    ...mapState(['address']),
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  data() {
    return {

      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
      privateKey: '',
      publicKey: '',
      exchangeRate: 10,
      toaddress: '',
      tovalue: '',
      passwordError: '',
      canCopy: !!navigator.clipboard,
      payType: {},
      cardTypeArr: []
    }
  },

  validations() {
    return {
      toaddress: [
        helpers.withMessage('请输入地址', _required),
        helpers.withMessage('输入的地址无效,请核对后重新输入!', value => {
          const regex = /^(0x[0-9a-fA-F]{40})$/
          if (value === '' || !regex.test(value)) {
            return false
          }
          else {
            return true
          }
        })
      ],
      tovalue: [
        helpers.withMessage('请填写充值金额', _required)
      ]
    }
  },
  watch: {
    localVisible(newValue) {
      // 当本地副本改变时，触发事件通知父组件更新
      this.$emit('update:visible', newValue)

    },
    address(newVal, oldVal) {
      this.toaddress = this.address
      console.log(newVal, oldVal)
    },
    async visible(v, oldv) {
      // 当父组件的 prop 更新时，更新本地副本
      this.localVisible = v
    }
  },
  async mounted() {
    this.toaddress = this.address
    // console.log(this.toaddress)
    const cardList = await getCardList()
    console.log('cardList:', cardList)
    if (cardList) {
      this.cardTypeArr = cardList['card_lists']
      if (this.cardTypeArr.length > 0) {
        this.payType = this.cardTypeArr[0]
      }
    }
  },
  methods: {

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
    async addPay() {
      this.showAddPay()
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
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },

    reset() {
      this.password = ''
      this.v$.$reset()
    }
  },

  setup() {
    return {
      v$: useVuelidate(), ShieldExclamationIcon,
      InfoFilled
    }
  }
}
</script>

<style scoped>
</style>
