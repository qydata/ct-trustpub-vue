<template>
  <div>
    <ForgetWallet :close="closeForgetWalletModal" :afterForget="afterForgetWallet" :visible="true"
                  v-if="showForgetWalletModal"/>
    <ExportKey :close="closeExportKeyModal" :visible="true" v-if="showExportKeyModal"/>
    <AuthBindModal :afterAuthBind="gotoCharge" :close="closeCreateModal"
                   :visible="true" v-if="createAndImportModal === 'authBind'"/>
    <SessionsModal :afterAuthBind="closeCreateModal" :close="closeCreateModal"
                   :visible="true" v-if="createAndImportModal === 'sessions'"/>
    <ChargeModal :afterCharge="gotoOverview" :visible="true" v-if="createAndImportModal === 'charge'"
                 :label="'header'"/>
    <PayCardModal
      :afterCharge="closeCreateModal"
      :showAddPay="showAddPay"
      :visible="true" v-if="createAndImportModal === 'card'"/>
    <AddPayCardModal :afterCharge="openCardModal" :visible="true" v-if="createAndImportModal === 'addcard'"/>

    <v-app-bar :elevation="2" :collapse="false">

      <template v-slot:prepend>
        <v-avatar
          rounded="0">
          <v-img src="/assets/logo.svg" alt="CT Wallet"/>
        </v-avatar>
      </template>
      <template v-slot:title>
        <div class="hidden md:block">
          链上付
        </div>
      </template>
      <template v-slot:append>
        <v-chip size="large" rounded="xl">
          <template v-slot:prepend>
            <v-avatar size="24" color="white">
              <v-img src="/assets/address-icon.svg"/>
            </v-avatar>
          </template>
          <v-divider
            class="border-opacity-100 mx-2"
            vertical
          ></v-divider>
          {{ truncateString(address, 8) }}
        </v-chip>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn :icon="DotsVerticalIcon" variant="text" v-bind="props"></v-btn>
          </template>

          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="openCardModal"
                  :prepend-icon="CreditCardIcon"
                  variant="text"
                >我的支付
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="lock"
                  :prepend-icon="LockOpenIcon"
                  variant="text"
                >断开钱包连接
                </v-btn>
              </template>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="open('https://github.com/qydata/ct-trustpub-vue')"
                  :prepend-icon="LockOpenIcon"
                  variant="text"
                >开源链接
                </v-btn>
              </template>
            </v-list-item>

          </v-list>
        </v-menu>
      </template>
    </v-app-bar>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import AddPayCardModal from '@/components/index/AddPayCardModal'
import AuthBindModal from '@/components/index/AuthBindModal'
import SessionsModal from '@/components/index/SessionsModal'
import ChargeModal from '@/components/index/ChargeModal'
import ExportKey from '@/components/index/ExportModal'
import ForgetWallet from '@/components/index/ForgetModal'
import PayCardModal from '@/components/index/PayCardModal'
import {queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import {
  DotsVerticalIcon, ChevronDownIcon, SortDescendingIcon, UsersIcon, UserIcon,
  SparklesIcon,
  PlusIcon,
  SortAscendingIcon,
  CreditCardIcon,
  LockOpenIcon,
  KeyIcon
} from '@heroicons/vue/outline'
import {hasWallet} from '../utils/storage'
import AccountPanel from './AccountPanel.vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Header',
  data: function () {
    return {
      tab: '/overview',
      showForgetWalletModal: false,
      showExportKeyModal: false,
      showCreateModal: false,
      showImportKeyModal: false,
      createAndImportModal: '',
      showNav: false,
      mainNav: [
        {
          text: '链上付',
          link: '/publicity'
        }
      ]
    }
  },
  watch: {},
  computed: {
    ...mapState(['address', 'xctBalance'])
  },
  async mounted() {

    let _hasWallet = await this.hasWallet()
    if (!_hasWallet) {
      this.lock()
    }
    else {
      const needAuth = sessionStorage.getItem('needAuth')
      if (needAuth != null) {
        sessionStorage.removeItem('needAuth')
        await this.gotoAuthBind()
      }
    }
  },
  methods: {
    hasWallet,
    truncateString(input, length) {
      // 检查输入是否有效
      if (typeof input !== 'string') {
        throw new Error('The first argument must be a string.')
      }
      if (typeof length !== 'number' || length < 0) {
        throw new Error('The second argument must be a non-negative number.')
      }

      // 截取字符串并添加省略号
      return input.slice(0, length) + '...'
    },

    openLink(_item) {
      this.tab = '/dapp'
      window.open(_item.link)
    },
    async switchAccount(walletItem) {
      await storage.switchWallet(walletItem.p1, JSON.parse(JSON.stringify(walletItem.p2)), walletItem.walletName, storage.getHighestWalletVersion())
      this.$store.commit('setAddress', this.address)
      this.$store.dispatch('refresh')
      this.showTools = false

      // 跳转到总览
      location.reload()
    },
    lock() {
      this.$store.dispatch('forget')
      this.$store.commit('lock')
      this.$router.push('/')
    },
    closeForgetWalletModal() {
      this.showForgetWalletModal = false
    },
    openForgetWalletModal() {
      this.showNav = false
      this.showForgetWalletModal = true
    },
    afterForgetWallet() {
      this.$router.push('/')
    },
    closeExportKeyModal() {
      this.showExportKeyModal = false
    },
    closeCreateModal() {
      this.createAndImportModal = ''
    },
    async openAuthBindModal() {
      this.showNav = false
      // 判断是否实名
      queryCert({address: this.address}).then((res) => {
        if (res.code !== 200) {
          console.log(res.msg)
        }
        else if (!res.is_cert) {
          this.createAndImportModal = 'authBind'
        }
        else {
          this.$message.error('当前账户已经实名!')
        }
      }).catch((e) => {
        console.log(e)
      })
    },

    openCardModal() {
      this.showNav = false
      this.createAndImportModal = 'card'
    },
    showAddPay() {
      this.showNav = false
      this.createAndImportModal = 'addcard'
    },
    async gotoAuthBind() {

      // 判断是否实名
      const address = await storage.getAddress(storage.getHighestWalletVersion())
      queryCert({address: address}).then((res) => {
        if (res.code !== 200) {
          console.log(res.msg)
        }
        else if (!res.is_cert) {
          this.createAndImportModal = 'authBind'
        }
        else {
          this.createAndImportModal = 'charge'
        }
      }).catch((e) => {
        console.log(e)
      })

    },
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
    async authJudge(oriName) {

      // 查询实名状态
      const address = await storage.getAddress(storage.getHighestWalletVersion())
      queryCert({address: address}).then((res) => {
        if (res.code !== 200) {
          console.log(res.msg)
        }
        else if (!res.is_cert) {
          // 未实名
          this.createAndImportModal = ''
        }
        else if (this.isInIframe() === false) {
          this.createAndImportModal = oriName
        }
        else {
          this.createAndImportModal = ''
        }
      }).catch((e) => {
        console.log(e)
      })
    },
    async gotoCharge() {
      this.authJudge('charge')
    },
    async gotoOverview() {
      this.createAndImportModal = ''
      this.$router.push('overview')
    }
  },
  components: {
    AccountPanel,
    ForgetWallet,
    ExportKey,
    AuthBindModal,
    SessionsModal,
    ChargeModal,
    PayCardModal,
    AddPayCardModal
  },
  setup() {
    return {
      DotsVerticalIcon,
      ChevronDownIcon, UsersIcon, UserIcon,
      SparklesIcon, SortDescendingIcon,
      PlusIcon,
      SortAscendingIcon,
      CreditCardIcon,
      LockOpenIcon, KeyIcon
    }
  }
}
</script>
<style scoped>
</style>
