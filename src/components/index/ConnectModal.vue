<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="close"
            width="97%"
            max-width="36rem"
            v-model="localVisible">
    <v-card title="欢迎来到链上付" subtitle="从连接到一个钱包来开始">

      <v-container>
        <v-list variant="tonal" lines="three">

          <v-list-item
            rounded="xl"
            prepend-avatar="/assets/browser-wallet.svg">
            <template v-slot:title>浏览器钱包</template>
            <template v-slot:subtitle>浏览器钱包是管理数字资产并连接区块链应用的工具。</template>
            <template v-slot:append>
              <v-btn :loading="isUnlockLoading" rounded="xl" size="large"
                     v-if="connectStatus === 'onboarding'" class="" disabled>
                正在等待...
              </v-btn>
              <v-btn :loading="isUnlockLoading" rounded="xl" size="large"
                     v-else-if="connectStatus === 'connecting'" class="" disabled>
                正在连接...
              </v-btn>
              <v-btn :loading="isUnlockLoading" rounded="xl" size="large" v-else-if="hasMetaMask"
                     class="" @click="connect">连接
              </v-btn>
              <v-btn :loading="isUnlockLoading" rounded="xl" size="large" v-else
                     class=""
                     :disabled="!browserSupport">当前环境不支持
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import {fetchCardlist} from '@/utils/api'
import {LockOpenIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'
import {mapState} from 'vuex'
import {setCardList, setWalletAddress} from '../../utils/storage'
import {detect} from 'detect-browser'

const ABI_const = require('@/contract/ABI_const.js')
const _addressC = require('@/config/address.json')

const networks = {
  '0x1b': {
    key: 'ctchain',
    label: '草田链'
  }
}

const CryptoJS = require('crypto-js')
const ethers = require('ethers')
export default {
  name: 'ConnectModal',
  components: {},
  data() {
    return {
      isUnlockLoading: false,
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
      connectError: '',
      connectStatus: ''
    }
  },
  props: {
    afterUnlock: Function,
    close: Function,
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      address: 'address',
      walletVersion: 'version'
    })
  },
  mounted() {
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
  methods: {
    setAccounts(accounts, flag) {
      // https://eips.ethereum.org/EIPS/eip-1193#user-account-exposure-and-account-changes
      const [ethAddress] = accounts
      if (ethAddress === undefined) {
        this.connectError = 'No Ethereum address found.'
        this.connectStatus = ''
        return
      }
      if (ethAddress === this.ethAddress) return

      if (flag) {

        const provider = new ethers.providers.Web3Provider(window.ethereum)

        this.ethAddress = ethAddress

        this.contract = new ethers.Contract(
          _addressC['XCT'],
          ABI_const['XCT'].abi,
          provider.getSigner(0)
        )

        this.updateXctBalance()
        this.signOp(provider, ethAddress)
      }
    },
    async signOp(provider, ethAddress) {
      try {
        this.isUnlockLoading = true
        // do not specify wallet version here - this forces migration to highest version
        await setWalletAddress(ethAddress)
        this.$store.commit('setAddress', ethAddress)
        // await storage.setWalletVersion(storage.getHighestWalletVersion())
        this.$store.commit('unlock')
        this.$store.dispatch('refresh')
        // 获取 MetaMask 提供的签名器 (Signer)
        const signer = provider.getSigner()

        const currentTime = Math.floor(Date.now()).toString() // 获取当前时间戳并转换为字符串
        // 使用钱包签名时间戳

        const signature = await signer.signMessage(currentTime)

        // 验证签名
        const recoveredAddress = ethers.utils.verifyMessage(currentTime, signature)
        // TODO 获取支付信息
        const request =
          {signature: signature, timestamp: currentTime}

        // 获取连接的钱包地址
        const address = await signer.getAddress()
        this.fetchAllData(request).then(cardList => {
          console.log('cardList:', cardList)
          setCardList(address, cardList).then(() => {
            console.log('Object stored successfully!')
          }).catch(err => {
            console.error('Failed to store object:', err)
          })
        })
        this.afterUnlock()
      } catch (e) {
        console.log(e)
      } finally {
        this.isUnlockLoading = false
      }
    },
    async updateXctBalance() {
      let balance = await this.contract.balanceOf(this.ethAddress)
      balance = ethers.utils.formatEther(balance.toString())
      this.xctBalance = parseFloat(Math.floor(balance * 1e2) / 1e2)
    },
    setChainId(chainId) {
      // https://eips.ethereum.org/EIPS/eip-1193#chain-changes
      if (networks[chainId] === undefined) {
        this.connectError = 'Unsupported network. Please use Ethereum Mainnet or Rinkeby Test Network.'
        this.connectStatus = ''
        return
      }
      // TODO ensure correct network selected for mainnet/testnet
      this.chainId = chainId
      this.network = networks[this.chainId].key
      this.networkLabel = networks[this.chainId].label
    },
    async connect() {
      this.connectStatus = 'connecting'
      try {
        // https://eips.ethereum.org/EIPS/eip-1102#eth_requestaccounts
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})

        // https://eips.ethereum.org/EIPS/eip-695
        this.setChainId(await window.ethereum.request({method: 'eth_chainId'}))
        window.ethereum.on('chainChanged', this.setChainId)

        this.setAccounts(accounts, true)
        window.ethereum.on('accountsChanged', this.setAccounts)

      } catch (err) {
        console.error(err)
        this.connectError = err.message
        this.connectStatus = ''
        return
      }
    },
    browserSupport() {
      return ['brave', 'chrome', 'edge', 'firefox'].includes(detect().name)
    },
    hasMetaMask() {
      return window.ethereum !== undefined && (window.ethereum.isMetaMask || window.ethereum.isCtWallet)
    },
    sha256(message) {
      return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex)
    },

    async fetchAllData(request) {
      const results = await fetchCardlist(request)
      return results
    },

    async unlockOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      // 如果验证通过，手动触发按钮点击
      await this.unlock()
    }
  },
  setup() {
    return {
      LockOpenIcon, EyeIcon, EyeOffIcon
    }
  }
}
</script>
