<template>
  <v-container class=" d-flex align-center justify-center">
    <v-row justify="center" align="center">
      <v-col cols="6" md="3">
        <v-card title="余额:" variant="outlined" link @click="()=>{
          console.log('click')
        }">
          <template v-slot:subtitle>
            <Amount :value="xctBalance" :decimalPlaces="2" currency="rmb" sub/>
          </template>
          <template v-slot:prepend>
            <v-icon icon="mdi-white-balance-auto"/>
          </template>
        </v-card>
      </v-col>

      <v-col cols="6" md="3">
        <v-card color="primary" link @click="openSend">
          <template v-slot:title>
            <!--            <v-btn :prepend-icon="ArrowUpIcon" size="x-large" variant="elevated" @click="openSend">发送</v-btn>-->
            发送
          </template>
          <template v-slot:subtitle>
            发送人民币通证给其他用户
          </template>
          <template v-slot:prepend>
            <v-icon :icon="ArrowUpIcon"/>
          </template>
        </v-card>
      </v-col>

      <v-col cols="6" md="3">
        <v-card color="primary" :loading="isReceiveLoading" link @click="openReceive">
          <template v-slot:title>
            <!--            <v-btn :prepend-icon="ArrowUpIcon" size="x-large" variant="elevated" @click="openSend">发送</v-btn>-->
            接收
          </template>
          <template v-slot:subtitle>
            接收任意资产到草天链地址
          </template>
          <template v-slot:prepend>
            <v-icon :icon="ArrowDownIcon"/>
          </template>
        </v-card>
      </v-col>

      <v-col cols="6" md="3">

        <v-card color="primary" link @click="openExchange">
          <template v-slot:title>
            <!--            <v-btn :prepend-icon="ArrowUpIcon" size="x-large" variant="elevated" @click="openSend">发送</v-btn>-->
            交易
          </template>
          <template v-slot:subtitle>
            对账户持有的人民币通证进行交易
          </template>
          <template v-slot:prepend>
            <v-icon :icon="Connection"/>
          </template>
        </v-card>
      </v-col>
    </v-row>
    <div class="account-panel">

      <div class="account-panel__modals">
        <SellModal :close="openExchange" v-if="modal == 'sell'" :visible="true"/>
        <BuyModal :close="openExchange" v-if="modal === 'buy'" :visible="true"/>
        <ReceiveModal :close="reset" v-if="modal === 'receive'" :visible="true"/>
        <AuthBindModal :afterAuthBind="reset" :close="reset" v-if="modal == 'authBind'" :visible="true"/>
        <SendModal :close="reset" :item="item" v-if="modal === 'send'" :visible="true"/>
        <SwapModal
          :close="reset"
          :openDeposit="openDeposit"
          :openWithdraw="openWithdraw"
          :openSell="openSell"
          v-if="modal === 'swap'" :visible="true"
        />
        <ExchangeModal
          :close="reset"
          :openDeposit="openDeposit"
          :openWithdraw="openWithdraw"
          :openBuy="openBuy"
          :openCharge="openCharge"
          :openSell="openSell"
          v-if="modal === 'exchange'" :visible="true"
        />
        <ChargeModal :close="openExchange" :afterCharge="openPay" v-if="modal === 'charge'" :visible="true"
                     :label="'accountPanel'"/>
        <PayModal :close="closePay" :order="order" v-if="modal === 'pay'" :visible="true"/>
        <PayH5Modal :close="closePay" :order="order" v-if="modal === 'h5pay'" :visible="true"/>

      </div>
    </div>
  </v-container>
</template>

<script>
import {queryCert} from '@/utils/api'

import {mapState} from 'vuex'
import Amount from './Amount.vue'
import AuthBindModal from './index/AuthBindModal.vue'
import ChargeModal from './index/ChargeModal'
import PayModal from './index/PayModal'
import PayH5Modal from './index/PayH5Modal'
import BuyModal from './tx/BuyModal'
import ExchangeModal from './tx/ExchangeModal'
import ReceiveModal from './tx/ReceiveModal'
import SellModal from './tx/SellModal'
import SendModal from './tx/SendModal'
import SwapModal from './tx/SwapModal'
import {InfoFilled, Connection, EditPen, Menu} from '@element-plus/icons-vue'
import {ArrowDownIcon, ArrowUpIcon, ClipboardCopyIcon, ClockIcon, XCircleIcon} from '@heroicons/vue/outline'

// eslint-disable-next-line no-undef
const ethers = require('ethers')

export default {
  name: 'AccountPanel',
  props: ['view'],
  components: {
    Amount,
    ReceiveModal,
    SellModal,
    BuyModal,
    SendModal,
    AuthBindModal,
    SwapModal,
    ExchangeModal,
    ChargeModal,
    PayH5Modal,
    PayModal
  },
  computed: mapState(['address', 'balance', 'xctBalance', 'cnyBalance', 'showAlert', 'alertMessage', 'alertType']),

  data() {
    return {
      tab: '余额',
      items: [
        '余额'
      ],
      modal: '',
      canCopy: !!navigator.clipboard,
      item: {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      },
      order: {},
      value: '',
      cities: [
        {
          value: 'Beijing',
          label: 'Beijing'
        },
        {
          value: 'Shanghai',
          label: 'Shanghai'
        },
        {
          value: 'Nanjing',
          label: 'Nanjing'
        },
        {
          value: 'Chengdu',
          label: 'Chengdu'
        },
        {
          value: 'Shenzhen',
          label: 'Shenzhen'
        },
        {
          value: 'Guangzhou',
          label: 'Guangzhou'
        }],
      dialogVisible: false,
      isReceiveLoading: false,
      isMobile: false
    }
  },
  watch: {
    async address() {
    },
    balance(newVal, oldVal) {
      // console.log('balance newVal', newVal)
      this.item.balance = newVal
    }
  },
  async mounted() {
    // 检测是否为移动端
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

    if (this.$route.query.modal) {
      this.modal = this.$route.query.modal
    }
  },
  methods: {
    formatUnits(value, decimals) {
      return ethers.utils.formatUnits(value, decimals)
    },
    sendErc20(token) {
      this.item = token
      this.item.type = token.token.type
      this.item.balance = token.value
      this.item.decimals = token.token.decimals
      this.item.name = token.token.name
      this.item.symbol = token.token.symbol
      this.modal = 'send'
    },
    dropDown(items) {
      switch (items.token.type) {
      case 'ERC-1155':
      case 'ERC-721':
        console.log(items)
        window.open(`https://ctblock.cn/token/${items.token.address}/instance/${items.token_id}`)
        break
      default:
        console.log(items)
        window.open(`https://ctblock.cn/token/${items.token.address}`)
        break
      }

    },
    closeCharge() {
      this.modal = ''
    },
    openPay(order) {

      console.log(order)
      this.order = order
      if (this.isMobile) {
        this.modal = 'h5pay'
      }
      else {
        this.modal = 'pay'
      }
    },
    closePay() {
      this.modal = ''
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },

    openDeposit() {
      this.modal = 'deposit'
    },
    async authJudge(oriName) {

      // 查询实名状态
      const address = this.address
      queryCert({address: address})
        .then((res) => {
          if (res.code !== 200) {
            console.log(res.msg)

            if (res.msg == undefined) {
              this.$message.error('查询实名认证出错')
            }
            else {
              this.$message.error(res.msg)
            }
          }
          else if (!res.is_cert) {
            const r = confirm('当前账户未进行实名认证, 认证过后才可以进行手续费接收和充值, 点击确认去认证!')
            if (r == true) {
              console.log('You pressed OK!')
              this.modal = 'authBind'
            }
          }
          else {
            this.modal = oriName
          }
        }).catch((e) => {
        console.log(e)
        this.$message.error('查询实名认证失败')
      }).finally(() => {
        this.isReceiveLoading = false
      })
    },
    async openReceive() {
      this.isReceiveLoading = true
      await this.authJudge('receive')
    },
    openSell() {
      this.modal = 'sell'
    },
    openBuy() {
      this.modal = 'buy'
    },
    openSend() {
      this.item = {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      }
      this.modal = 'send'
    },
    openSwap() {
      this.modal = 'swap'
    },
    openExchange() {
      this.modal = 'exchange'
    },
    async openCharge() {
      // 查询实名状态
      await this.authJudge('charge')
    },
    openWithdraw() {
      this.modal = 'withdraw'
    },
    reset() {
      this.modal = ''
    }
  },
  setup() {
    return {ArrowUpIcon, ArrowDownIcon, Connection, ClipboardCopyIcon, EditPen, InfoFilled, Menu}
  }
}

</script>

<style scoped>
.scrollable-container {
  height: 70vh;
  overflow-y: auto;
}

.scrollable-container::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}

.scrollable-container::-webkit-scrollbar-thumb {
  background-color: #888; /* 滚动条滑块颜色 */
  border-radius: 4px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* 滑块悬停颜色 */
}

.scrollable-container::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* 滑道颜色 */
}
</style>
