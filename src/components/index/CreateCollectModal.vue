<template>
  <div>
    <Modal :close="cancel" :visible="visible">
      <template v-slot:header>
        <h2>创建合约</h2>
      </template>

      <template v-slot:body>
        <div class="pt-15">

          <div class="form-group">
            <label>选择协议</label>
            <div class="relative input-wrap">
              <ProtocolList :updateData="updateData"/>
            </div>

          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-48 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
          <form>
            <div class="form-group" :class="{'form-group__error': v$.password.$error}">
              <label for="password">输入密码以加密此会话</label>
              <div class="relative input-wrap">

                <el-input
                  size="large"
                  type="password"
                  @keypress="createOnEnter"
                  autocomplete="off"
                  placeholder="输入你的密码"

                  v-model="v$.password.$model"
                  :prefix-icon="LockOpenIcon"
                />
              </div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{ passwordError }}
              </div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">返回</button>
            <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="create">下一步</button>
          </div>
        </div>
      </template>

    </Modal>
    <LoadingModal :visible="loading"/>
  </div>
</template>

<script>
import LoadingModal from '@/components/index/LoadingModal'
import ProtocolList from '@/components/ProtocolList'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {LockOpenIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import Modal from '../Modal'
import {Tickets} from '@element-plus/icons-vue'
const ethers = require('ethers')
const Web3 = require('web3')
const ABI_const = require('@/contract/ABI_const.js')
const ethUtil = require('ethereumjs-util')
export default {
  name: 'CreateModal',
  components: {
    LoadingModal,
    LockOpenIcon,
    Modal,
    ProtocolList,
    Tickets
  },
  props: {
    afterCreate: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      walletName: '',
      address: '',
      privateKey: '',
      publicKey: '',

      password: '',
      passwordError: '',
      canCopy: !!navigator.clipboard,
      loading: false,
      defaultV: 'ERC721Ctnft'
    }
  },
  validations() {
    return {
      password: [
        validation.passwordRequired,
        validation.passwordLength
      ]
    }
  },
  computed: {
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    updateData(defaultV) {
      this.defaultV = defaultV
    },
    cancel() {
      this.reset()
      this.close()
    },
    async create() {
      if (!await this.v$.$validate()) return
      // 判断 如果已经存在第一个钱包, 就进行密码验证
      if (((await storage.getWalletList(storage.getHighestWalletVersion()))).length > 0) {
        if (!await this.checkPassword()) return
      }

      // 开始去创建合约
      const that = this
      const type = this.defaultV
      // console.log(this.defaultV)
      this.loading = true
      // 以太币转账
      // 先获取当前账号交易的nonce
      const privateKey = await storage.getPrivateKey(this.password)
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      const wallet = new ethers.Wallet(privateKey, customHttpProvider)
      const gasPrice = (await customHttpProvider.getGasPrice()).toString()
      // console.log('gasPrice:', gasPrice.toString())

      // 创建收藏夹
      //    查询创建合约的手续费
      const {err, gaslimit} = await this.createCollectV2Call(type, wallet)

      if (gaslimit == 0) {
        this.$message.error(err)
        return
      }

      const collectAddress = await this.createCollectV2(
        wallet,
        gasPrice,
        gaslimit,
        type,
        true
      )
      if (collectAddress == null) {
        this.loading = false
        return
      }

      // console.log(collectAddress)
      this.contractAddress = collectAddress
      this.$message.success('创建成功, 请对合约进行初始化')
      this.loading = false
      this.afterCreate({
        contractAddress: this.contractAddress,
        defaultV: this.defaultV
      })
    },
    async createCollectV2Call(type, wallet) {
      // 常见合约工厂实例
      let factory
      if (type == 'ERC1155Ctnft') {
        //  1155
        factory = new ethers.ContractFactory(
          ABI_const['ERC1155Ctnft'].abi,
          ABI_const['ERC1155Ctnft'].bytecode,
          wallet
        )
      }
      else if (type == 'ERC721Ctnft') {
        //  721
        factory = new ethers.ContractFactory(
          ABI_const['ERC721Ctnft'].abi,
          ABI_const['ERC721Ctnft'].bytecode,
          wallet
        )
      }
      else if (type == 'ERC1155CtnftOwner') {
        //  721
        factory = new ethers.ContractFactory(
          ABI_const['ERC1155CtnftOwner'].abi,
          ABI_const['ERC1155CtnftOwner'].bytecode,
          wallet
        )
      }
      else {
        return {err: '没有找到匹配的合约信息', gaslimit: 0}
      }

      // 请注意，我们将 "Hello World" 作为参数传递给合约构造函数constructor
      const data = await factory.getDeployTransaction()
      const {err, gaslimit} = await new Promise((resolve, reject) => {
        const web3 = new Web3(this.$store.state.config.blockchain.baseURL)
        web3.eth.estimateGas(
          {
            data: data.data,
            value: 0,
            from: wallet.address
          },
          (err, gaslimit) => {
            console.log('err\n:' + err)
            console.log('gas:\n' + gaslimit)
            resolve({err, gaslimit})
          }
        )
      }).then((ret) => ret)
      // console.log({err, gaslimit})
      return {err, gaslimit}
    },

    // 创建收藏夹 ERC1155 支持懒铸造
    async createCollectV2(wallet, gasPrice, gasLimit, type, wait) {
      const web3 = new Web3(this.$store.state.config.blockchain.baseURL)
      const overrides = {
        // The maximum units of gas for the transaction to use
        gasLimit: web3.utils.numberToHex(gasLimit),
        // The price (in wei) per unit of gas
        gasPrice: web3.utils.numberToHex(gasPrice)
      }
      // 常见合约工厂实例
      let factory
      if (type == 'ERC1155Ctnft') {
        factory = new ethers.ContractFactory(
          ABI_const['ERC1155Ctnft'].abi,
          ABI_const['ERC1155Ctnft'].bytecode,
          wallet
        )
      }
      else if (type == 'ERC1155CtnftOwner') {
        factory = new ethers.ContractFactory(
          ABI_const['ERC1155CtnftOwner'].abi,
          ABI_const['ERC1155CtnftOwner'].bytecode,
          wallet
        )
      }
      else if (type == 'ERC721Ctnft') {
        factory = new ethers.ContractFactory(
          ABI_const['ERC721Ctnft'].abi,
          ABI_const['ERC721Ctnft'].bytecode,
          wallet
        )
      }
      else {
        return null
      }
      // 请注意，我们将 "Hello World" 作为参数传递给合约构造函数constructor
      try {
        const contract = await factory.deploy(overrides)
        // 部署交易有一旦挖出，合约地址就可用
        // 参考: https://ropsten.etherscan.io/address/0x2bd9aaa2953f988153c8629926d22a6a5f69b14e
        // console.log(contract.address)
        // "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E"
        // 发送到网络用来部署合约的交易
        // 查看: https://ropsten.etherscan.io/tx/0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51
        // console.log(contract.deployTransaction.hash)
        // "0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51"
        //合约还没有部署;我们必须等到它被挖出
        if (wait == true) {
          const recept = await contract.deployed()
        }
        // 好了 合约已部署。
        return contract.address
      }
      catch (error) {
        this.$message.error('创建错误, ' + error.reason)
        return null
      }
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
      this.v$.$reset()
    }
  },
  async mounted() {
  },
  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon
    }
  }
}
</script>

<style scoped>
.private-key {
  width: 32ch
}

.on-clicked-effect {
  transition: all 0.4s ease-in;
}

.on-clicked-effect:before {
  content: '';
  background-color: aliceblue;
  border-radius: 50%;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(0.001, 0.001);
}

.on-clicked-effect:focus:not(:active) {
  position: relative;
  display: inline-block;
  outline: 0;
}

.on-clicked-effect:focus:not(:active):before {
  animation: clicked_animation 0.8s ease-out;
}

@keyframes clicked_animation {
  50% {
    transform: scale(1.5, 1.5);
    opacity: 0;
  }
  99% {
    transform: scale(0.001, 0.001);
    opacity: 0;
  }
  100% {
    transform: scale(0.001, 0.001);
    opacity: 1;
  }
}
</style>
