<template>
  <div>
    <Modal :close="cancel" :visible="visible">
      <template v-slot:header>
        <h2>合约初始化</h2>
      </template>

      <template v-slot:body>
        <div class="pt-15">
          <div style="display: flex">
            <div class="form-group" style="flex: 2" :class="{'form-group__error': v$.name.$error}">
              <label for="name">名称</label>
              <div style="display: flex">
                <el-input
                  size="large"
                  type="text"
                  autocomplete="off"
                  placeholder="请输入初始化合约名称"
                  id="name"
                  v-model="v$.name.$model"
                  style="flex: 1"
                />

              </div>

              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.name.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>
            </div>
            <div style="width: 10px"></div>
            <div class="form-group" style="flex: 1" :class="{'form-group__error': v$.symbol.$error}">
              <label for="symbol">符号(简称)</label>
              <div style="display: flex">
                <el-input
                  size="large"
                  type="text"
                  autocomplete="off"
                  placeholder="请输入合约简称"
                  id="symbol"
                  v-model="v$.symbol.$model"
                  style="flex: 1"
                />

              </div>

              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.symbol.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>
            </div>

          </div>

          <div class="form-group" :class="{'form-group__error': v$.tokenUrlPrefix.$error}">
            <label for="tokenUrlPrefix">NFT元数据访问前缀</label>
            <div class="relative input-wrap">
              <el-input
                size="large"
                type="text"
                autocomplete="off"
                placeholder="请输入元数据访问前缀"
                id="tokenUrlPrefix"
                v-model="v$.tokenUrlPrefix.$model"
                :prefix-icon="EditPen"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.tokenUrlPrefix.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.contractUrl.$error}">
            <label for="contractUrl">合约元数据URL</label>
            <div class="relative input-wrap">
              <el-input
                size="large"
                autocomplete="off"
                placeholder="情输入合约元数据"
                id="contractUrl"
                v-model="v$.contractUrl.$model"
                :prefix-icon="EditPen"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.contractUrl.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>

        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-48 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
          <form>
            <div class="flex items-start leading-8 text-gray mb-14">
          <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
            <ShieldExclamationIcon/>
          </span>
              <p>确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了详细信息，您将无法访问您的钱包。请输入您的密码以确认您已备份您的详细信息。</p>
            </div>
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
            <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="sendCreateInit">进行初始化
            </button>
          </div>
        </div>
      </template>
    </Modal>
    <LoadingModal :visible="loading"/>
  </div>
</template>

<script>
import LoadingModal from '@/components/index/LoadingModal'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {LockOpenIcon, RefreshIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {required as _required, helpers} from '@vuelidate/validators'
import Modal from '../Modal'

const TRANSACTION_RECEIPT_STATUS = {
  SUCCESS: 1,
  REVERTED: 0
}
const ethers = require('ethers')
const Web3 = require('web3')
import {Delete, Download, EditPen, Plus, ZoomIn} from '@element-plus/icons-vue'
const ethUtil = require('ethereumjs-util')
const ABI_const = require('@/contract/ABI_const.js')
export default {
  name: 'CreateModal',
  components: {
    LoadingModal,
    Modal,
    EditPen,
    ShieldExclamationIcon
  },
  props: {
    afterInit: Function,
    close: Function,
    visible: Boolean,
    itemContract: {
      type: Object,
      default: () => ({
        contractAddress: null,
        defaultV: null
      })
    }
  },
  data() {
    return {
      // itemContract: {
      //   contractAddress: '0xc4120cA731F53F5b0237210755c31f3F14C8e222',
      //   defaultV: 'ERC721Ctnft'
      // },
      address: '',
      privateKey: '',
      publicKey: '',
      password: '',
      passwordError: '',
      canCopy: !!navigator.clipboard,

      name: '',
      symbol: '',
      tokenUrlPrefix: 'https://dream.chaonft.cn/',
      contractUrl: '',
      loading: false
    }
  },
  validations() {
    return {
      name: [
        helpers.withMessage('请输入合约名称。', _required)
      ],
      symbol: [
        helpers.withMessage('请输入合约简称。', _required)
      ],
      tokenUrlPrefix: [
        helpers.withMessage('请输入NFT元数据访问前缀。', _required)
      ],
      contractUrl: [
        helpers.withMessage('请输入合约元数据地址。', _required)
      ],
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
    async collectInitCall(
      name,
      symbol,
      tokenUrlPrefix,
      contractUrl,
      type,
      collectAddress,
      wallet
    ) {
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })

      if (type == 'ERC1155Ctnft') {
        const contract = new ethers.Contract(
          collectAddress,
          ABI_const['ERC1155Ctnft'].abi,
          customHttpProvider
        )
        const contractWithSigner = contract.connect(wallet)
        const {err, gaslimit} = await contractWithSigner.estimateGas
          .__ERC1155Ctnft_init(name, symbol, tokenUrlPrefix, contractUrl)
          .then((ret) => ({err: null, gaslimit: ret}))
          .catch((err) => {
            console.log('err:', err)
            return {err: err, gaslimit: null}
          })
        return {err, gaslimit}
      }
      else if (type == 'ERC1155CtnftOwner') {
        const contract = new ethers.Contract(
          collectAddress,
          ABI_const['ERC1155CtnftOwner'].abi,
          customHttpProvider
        )
        const contractWithSigner = contract.connect(wallet)
        const {err, gaslimit} = await contractWithSigner.estimateGas
          .__ERC1155Ctnft_init(name, symbol, tokenUrlPrefix, contractUrl)
          .then((ret) => ({err: null, gaslimit: ret}))
          .catch((err) => {
            console.log('err:', err)
            return {err: err, gaslimit: null}
          })
        return {err, gaslimit}
      }
      else if (type == 'ERC721Ctnft') {
        // 721
        const contract = new ethers.Contract(
          collectAddress,
          ABI_const['ERC721Ctnft'].abi,
          customHttpProvider
        )
        const contractWithSigner = contract.connect(wallet)
        const {err, gaslimit} = await contractWithSigner.estimateGas
          .__ERC721Ctnft_init(name, symbol, tokenUrlPrefix, contractUrl)
          .then((ret) => ({err: null, gaslimit: ret}))
          .catch((err) => {
            console.log('err:', err)
            return {err: err, gaslimit: null}
          })
        return {err, gaslimit}
      }
      else {
        return {err: '未实现的合约类型', gaslimit: null}
      }
    },
    async sendCreateInit() {
      const that = this
      if (!await this.v$.$validate()) return
      // 判断 如果已经存在第一个钱包, 就进行密码验证
      if (((await storage.getWalletList(storage.getHighestWalletVersion()))).length > 0) {
        if (!await this.checkPassword()) return
      }

      const privateKey = await storage.getPrivateKey(this.password)
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })

      const wallet = new ethers.Wallet(privateKey, customHttpProvider)
      this.loading = true
      // 以太币转账
      // 先获取当前账号交易的nonce
      //    初始化  送手续费  {err, gaslimit}
      const resultGas = await this.collectInitCall(
        this.name,
        this.symbol,
        this.tokenUrlPrefix,
        this.contractUrl,
        this.itemContract.defaultV,
        this.itemContract.contractAddress,
        wallet
      )
      if (resultGas.err != null) {
        console.log(resultGas.err)
        console.log('createCollectV2Call faild', {
          message: resultGas.err.reason
        })
        this.$message.error('初始化错误, ' + resultGas.err.reason)
        this.loading = false
        return
      }

      //    初始化{err, hash}
      const result1 = await this.collectInit(
        this.name,
        this.symbol,
        this.tokenUrlPrefix,
        this.contractUrl,
        this.itemContract.defaultV,
        this.itemContract.contractAddress,
        wallet
      )
      if (result1.err != null) {
        console.log('txTransfer faild', {message: result1.err})
        this.loading = false
      }
      console.log(result1)
      //初始化成功
      this.$message.warning(
        '新创建的合约请先进行NFT创建, 否则合约记录可能会丢失!'
      )
      this.loading = false
      this.afterInit({
        defaultV: this.itemContract.defaultV,
        contractAddress: this.itemContract.contractAddress
      })
    },
    async collectInit(
      name,
      symbol,
      tokenUrlPrefix,
      contractUrl,
      type,
      collectAddress,
      wallet
    ) {
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      if (type == 'ERC1155Ctnft') {
        try {
          const contract = new ethers.Contract(
            collectAddress,
            ABI_const ['ERC1155Ctnft'].abi,
            customHttpProvider
          )
          const contractWithSigner = contract.connect(wallet)
          const tx = await contractWithSigner
            .__ERC1155Ctnft_init(name, symbol, tokenUrlPrefix, contractUrl)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
              this.$message.error('铸造错误, ' + err.reason)
              return err
            })
          const recept = await customHttpProvider
            .waitForTransaction(tx.hash)
            .then((ret) => ret)
            .catch((err) => {
              this.$message.error('铸造错误, ' + err.reason)
              return err
            })
          console.log(recept)
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw {message: 'Transaction Reverted'}
          }

          return {err: null, hash: tx.hash}
        }
        catch (err) {
          return {err: err, hash: null}
        }
      }
      else if (type == 'ERC1155CtnftOwner') {
        try {
          const contract = new ethers.Contract(
            collectAddress,
            ABI_const ['ERC1155CtnftOwner'].abi,
            customHttpProvider
          )
          const contractWithSigner = contract.connect(wallet)
          const tx = await contractWithSigner
            .__ERC1155Ctnft_init(name, symbol, tokenUrlPrefix, contractUrl)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
              this.$message.error('铸造错误, ' + err.reason)
              return err
            })
          const recept = await customHttpProvider
            .waitForTransaction(tx.hash)
            .then((ret) => ret)
            .catch((err) => {
              this.$message.error('铸造错误, ' + err.reason)
              return err
            })
          console.log(recept)
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw {message: 'Transaction Reverted'}
          }

          return {err: null, hash: tx.hash}
        }
        catch (err) {
          return {err: err, hash: null}
        }
      }
      else if (type == 'ERC721Ctnft') {
        // 721
        try {
          const contract = new ethers.Contract(
            collectAddress,
            ABI_const ['ERC721Ctnft'].abi,
            customHttpProvider
          )
          const contractWithSigner = contract.connect(wallet)
          const tx = await contractWithSigner
            .__ERC721Ctnft_init(name, symbol, tokenUrlPrefix, contractUrl)
            .then((ret) => ret)
            .catch((err) => {
              this.$message.error('铸造错误, ' + err.reason)
              return err
            })
          const recept = await customHttpProvider
            .waitForTransaction(tx.hash)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
            })
          console.log(recept)
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw {message: 'Transaction Reverted'}
          }

          return {err: null, hash: tx.hash}
        }
        catch (err) {
          return {err: err, hash: null}
        }
      }
      else {
        return {err: '未实现的合约类型', hash: null}
      }
    },

    async createCollectV2Call(type, wallet) {
      // 常见合约工厂实例
      const web3 = new Web3(this.$store.state.config.blockchain.baseURL)
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
      console.log({err, gaslimit})
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
      const contract = await factory.deploy(overrides)
      // 部署交易有一旦挖出，合约地址就可用
      // 参考: https://ropsten.etherscan.io/address/0x2bd9aaa2953f988153c8629926d22a6a5f69b14e
      console.log(contract.address)
      // "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E"
      // 发送到网络用来部署合约的交易
      // 查看: https://ropsten.etherscan.io/tx/0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51
      console.log(contract.deployTransaction.hash)
      // "0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51"
      //合约还没有部署;我们必须等到它被挖出
      if (wait == true) {
        const recept = await contract.deployed()
      }
      // 好了 合约已部署。
      return contract.address
    },

    cancel() {
      this.reset()
      this.close()
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
    console.log(this.itemContract)
  },
  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon,
      EditPen
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
