<template>
  <div>
    <Modal :close="cancel" :visible="visible">
      <template v-slot:header>
        <h2>创建NFT</h2>
      </template>

      <template v-slot:body>
        <div class="pt-15">

          <div class="form-group">
            <label>收藏夹选择</label>
            <div class="relative input-wrap pt-13">

              <el-radio-group v-model="radioVal">
                <div
                  style="height: 90px"
                  v-for="(item, index) in contractList"
                  v-bind:key="index"
                >
                  <el-radio :label="item">
                    <!--                  名称:{{ item.name }}({{ item.symbol }})-->
                    名称:{{ item.name }}
                    <el-alert
                      :title="'类型:' + item.type"
                      type="success"
                      :closable="false"
                      :description="'合约地址:' + addressFormat(item.contractAddress)"
                    />
                  </el-radio>
                </div>

                <div
                  v-if="contractList.length == 0"
                >
                  <el-radio label="创建收藏夹">
                    <el-alert
                      title="创建收藏夹"
                      type="success"
                      :closable="false"
                      description="点击去创建收藏夹"
                    />
                  </el-radio>
                </div>
              </el-radio-group>
            </div>
          </div>
          <div class="form-group">
            <label>上传资源</label>
            <el-upload action="#"
                       accept="image/*"
                       list-type="picture-card"
                       :file-list="fileList"
                       :limit="limitCount"
                       :class="{hide:hideUpload}"
                       :on-change="
                    (file, fileList) => handleChange(file, fileList, 1)
                  "
                       :auto-upload="false">
              <el-icon>
                <Plus/>
              </el-icon>

              <template #file="{ file }">
                <div>
                  <img class="el-upload-list__item-thumbnail" :src="file.url" alt=""/>
                  <span class="el-upload-list__item-actions">
                        <span
                          v-if="!disabled"
                          class="el-upload-list__item-delete"
                          @click="handleRemove(file)"
                        >
                          <el-icon><Delete/></el-icon>
                        </span>
                  </span>
                </div>
              </template>
            </el-upload>

          </div>
          <div class="form-group" :class="{'form-group__error': v$.title.$error}">
            <label for="title">标题</label>
            <div class="relative input-wrap">
              <el-input
                size="large"
                autocomplete="off"
                placeholder="请输入NFT标题"
                id="title"
                v-model="v$.title.$model"
                :prefix-icon="EditPen"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.title.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.author_description.$error}">
            <label for="author_description">持有者</label>
            <div class="relative input-wrap">
              <el-input
                size="large"
                autocomplete="off"
                placeholder="请输入NFT持有者信息"
                id="author_description"
                v-model="v$.author_description.$model"
                :prefix-icon="EditPen"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.author_description.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>

          </div>
          <div class="form-group" :class="{'form-group__error': v$.description.$error}">
            <label for="description">描述</label>
            <div class="relative input-wrap">
              <el-input
                size="large"
                :rows="3"
                type="textarea"
                autocomplete="off"
                placeholder="请输入NFT描述"
                id="description"
                v-model="v$.description.$model"
                :prefix-icon="EditPen"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.description.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>
          <div class="form-group" v-show="showSupplyInput">
            <label for="supply">发行数量</label>
            <div class="relative input-wrap">
              <el-input
                size="large"
                type="number"
                autocomplete="off"
                placeholder="请输入发行数量"
                id="supply"
                v-model="supply"
                :prefix-icon="LockOpenIcon"
              />
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
              <p>
                确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了详细信息，您将无法访问您的钱包。请输入您的密码以确认您已备份您的详细信息。</p>
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
            <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="sedMintTx">创建数字NFT
            </button>
          </div>
          <el-dialog v-model="dialogVisible">
            <img w-full :src="dialogImageUrl" alt="Preview Image"/>
          </el-dialog>
        </div>
      </template>
    </Modal>
    <LoadingModal :visible="loading"/>
  </div>
</template>

<script>
import LoadingModal from '@/components/index/LoadingModal'
import ContractList from '@/components/ProtocolList'
import {fetchDisplay} from '@/utils/api'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
// EditPen <el-icon><EditPen /></el-icon>
import {Delete, Download, EditPen, Plus, ZoomIn} from '@element-plus/icons-vue'
import {LockOpenIcon, PencilIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'

import {required as _required, helpers} from '@vuelidate/validators'
import Modal from '../Modal'

const ipfsAPI = require('ipfs-api')
const ipfsNode = ipfsAPI({host: 'nft.ctsign.cn', port: '/ipfs', protocol: 'https'})

const TRANSACTION_RECEIPT_STATUS = {
  SUCCESS: 1,
  REVERTED: 0
}
const ABI_const = require('@/contract/ABI_const.js')
const ethers = require('ethers')
const Web3 = require('web3')
const ethUtil = require('ethereumjs-util')
export default {
  name: 'CreateModal',
  components: {
    LoadingModal,
    EditPen,
    Modal,
    ShieldExclamationIcon, Delete, Plus
  },
  props: {
    afterCreate: Function,
    createCollect: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      address: '',
      privateKey: '',
      publicKey: '',
      hideUpload: false,
      password: '',
      limitCount: 1,
      passwordError: '',
      canCopy: !!navigator.clipboard,
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      contractList: [],
      radioVal: '',
      title: '',
      description: '',
      image: '',
      author_description: '',
      supply: 1,
      showSupplyInput: false,
      fileList: [],
      loading: false
    }
  },
  validations() {
    return {
      title: [
        helpers.withMessage('请输入NFT标题。', _required)
      ],
      description: [
        helpers.withMessage('请输入NFT描述。', _required)
      ],
      author_description: [
        helpers.withMessage('请输入NFT持有者信息。', _required)
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
  watch: {
    radioVal(newVal, oldVal) {
      if (newVal == '创建收藏夹') {
        this.radioVal = ''
        this.createCollect()
      }
      else if (newVal && newVal.type == 'ERC-1155') {
        this.showSupplyInput = true
      }
      else {
        this.showSupplyInput = false
      }


    }
  },
  methods: {
    async fileUpload(data) {
      const imgResponse = await ipfsNode
        .add(Buffer.from(data))
        // .add(Buffer.from(data))
        .then((imgResponse) => imgResponse)
        .catch((err) => {
          console.error(err)
          return err
        })
      ipfsNode.pin.add(imgResponse[0].path)
      const imgIpfsAddress = imgResponse[0].path
      this.image =
        'https://dream.chaonft.cn/ipfs/api/v0/cat/' + imgIpfsAddress
      console.log('this.image', this.image)
    },

    Mint1155Data(tokenId, tokenURI, supply, creators, royalties, signatures) {
      return {
        tokenId,
        tokenURI,
        supply,
        creators,
        royalties,
        signatures
      }
    },

    Mint721Data(tokenId, tokenURI, creators, royalties, signatures) {
      return {
        tokenId,
        tokenURI,
        creators,
        royalties,
        signatures
      }
    },

    handleChange(file, fileList, type) {
      this.hideUpload = fileList.length >= this.limitCount
      this.fileList = fileList
      const that = this
      const binaryData = []
      binaryData.push(file.raw)
      // this.fileName = file.name.substring(this.fileName.lastIndexOf("/") + 1);
      this.fileName = file.name
      const reader = new FileReader()
      reader.readAsArrayBuffer(new Blob(binaryData))
      // eslint-disable-next-line no-unused-vars
      reader.onload = function (e) {
        // that.form.ParentCollectionFileBuffer = reader.result;
        console.log(reader.result)
        that.fileUpload(reader.result)
        //PIN
      }
    },
    Part(account, value) {
      return {
        account,
        value
      }
    },
    async sedMintTx() {
      const that = this
      const web3 = new Web3(this.$store.state.config.blockchain.baseURL)
      if (!await this.v$.$validate()) return
      // 判断 如果已经存在第一个钱包, 就进行密码验证
      if (((await storage.getWalletList(storage.getHighestWalletVersion()))).length > 0) {
        if (!await this.checkPassword()) return
      }
      const privateKey = await storage.getPrivateKey(this.password)
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      let type = 0
      if (this.radioVal.type == 'ERC-721') {
        type = 9
      }

      if (this.radioVal.type == 'ERC-1155') {
        type = 10
      }
      if (type == 0) {
        this.$message.error('合约选择错误!')
        return
      }
      if (!this.image) {
        this.$message.error('请上传NFT封面!')
        return
      }
      that.loading = true
      that.fasongButton = 'clickfasongjiaoyi'
      const collectAddress = this.radioVal.contractAddress
      const tokenId = this.address + 'd1234567890' + Date.now()
      // let tokenId = this.address + "d1234567890" + "1234567890123";
      const transferTo = this.address
      const signatures = []
      const minter = this.address
      const creators = this.Part(minter, 10000)
      // 以太币转账
      // 先获取当前账号交易的nonce
      const wallet = new ethers.Wallet(privateKey, customHttpProvider)
      const reqdata = {}
      reqdata.fileName = this.fileName
      reqdata.image = this.image
      reqdata.title = this.title
      reqdata.authorDescription = this.author_description
      reqdata.description = this.description
      const response = await ipfsNode
        .add(Buffer.from(JSON.stringify(reqdata), 'utf-8'))
        .then((response) => response)
        .catch((err) => {
          console.error(err)
        })
      ipfsNode.pin.add(response[0].path)
      let tokenURI = response[0].path
      const gasPrice = (await customHttpProvider.getGasPrice()).toString()
      console.log('gasPrice:', gasPrice.toString())

      let tx

      if (type == 10 || type == 12) {
        const supply = this.supply
        const contract = new ethers.Contract(
          collectAddress,
          ABI_const['ERC1155Ctnft'].abi,
          customHttpProvider
        )

        if (
          collectAddress.toString().toLowerCase() ==
          '0xA9d539e9B9B0d3885bC2056C9482B2aE7277a1Da'.toLowerCase()
        ) {
          tokenURI = '/' + tokenURI
        }
        // 使用签名器创建一个新的合约实例，它允许使用可更新状态的方法
        const contractWithSigner = contract.connect(wallet)
        const gasLimit = await contractWithSigner.estimateGas
          .mintAndTransfer(
            this.Mint1155Data(
              tokenId,
              tokenURI,
              supply,
              [creators],
              [],
              [signatures]
            ),
            transferTo,
            supply
          )
          .then((ret) => ret)
          .catch((err) => {
            this.$message.error('铸造错误, ' + err.reason)
            that.loading = false
            return null
          })

        if (gasLimit == null) {
          that.loading = false
          return
        }
        const overrides = {
          // The maximum units of gas for the transaction to use
          gasLimit: web3.utils.numberToHex(gasLimit),
          // The price (in wei) per unit of gas
          gasPrice: web3.utils.numberToHex(gasPrice)
          // The nonce to use in the transaction
          // nonce: nonce,
          // The amount to send with the transaction (i.e. msg.value)
          // value: utils.parseEther('1.0'),
          // The chain ID (or network ID) to use
          // chainId: 27
        }

        // 设置一个新值，返回交易
        tx = await contractWithSigner
          .mintAndTransfer(
            this.Mint1155Data(
              tokenId,
              tokenURI,
              supply,
              [creators],
              [],
              [signatures]
            ),
            transferTo,
            supply,
            overrides
          )
          .then((ret) => ret)
          .catch((err) => {
            console.log('err:', err)
            that.loading = false
            return err
          })
        // console.log("tx:", tx.toString().startsWith('0x'))
        // console.log("tx:", tx);

        console.log('hash:', tx.hash)
      }
      else if (type == 9) {
        const contract = new ethers.Contract(
          collectAddress,
          ABI_const['ERC721Ctnft'].abi,
          customHttpProvider
        )
        const contractWithSigner = contract.connect(wallet)
        const gasLimit = await contractWithSigner.estimateGas
          .mintAndTransfer(
            this.Mint721Data(
              tokenId,
              tokenURI,
              [creators],
              [],
              [signatures]
            ),
            transferTo
          )
          .then((ret) => ret)
          .catch((err) => {
            console.log('err:', err)
            this.$message.error('铸造错误, ' + err.reason)
            that.loading = false
            return null
          })

        if (gasLimit == null) {
          return
        }
        console.log('gasLimit:', gasLimit.toString())

        const overrides = {
          // The maximum units of gas for the transaction to use
          gasLimit: web3.utils.numberToHex(gasLimit),
          // The price (in wei) per unit of gas
          gasPrice: web3.utils.numberToHex(gasPrice)
          // The nonce to use in the transaction
          // nonce: nonce,
          // The amount to send with the transaction (i.e. msg.value)
          // value: utils.parseEther('1.0'),
          // The chain ID (or network ID) to use
          // chainId: 27
        }
        // 设置一个新值，返回交易
        tx = await contractWithSigner
          .mintAndTransfer(
            this.Mint721Data(
              tokenId,
              tokenURI,
              [creators],
              [],
              [signatures]
            ),
            transferTo,
            overrides
          )
          .then((ret) => ret)
          .catch((err) => {
            console.log('err:', err)
            that.loading = false
            return err
          })
        // console.log("tx:", tx.toString().startsWith('0x'))
        // console.log("tx:", tx);

        // 查看: https://ropsten.etherscan.io/tx/0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364
        console.log('hash:', tx.hash)
        // 操作还没完成，需要等待挖矿
      }
      else {
        console.log('error submit!!')
        return
      }
      const recept = await customHttpProvider
        .waitForTransaction(tx.hash)
        .then((ret) => ret)
        .catch((err) => {
          that.loading = false
          console.log('err:', err)
        })
      console.log(recept)
      if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
        that.loading = false
        throw {message: 'Transaction Reverted'}
      }

      const recept1 = await tx.wait()
      // setTimeout(that.gotrading(), 5000);
      that.loading = false
      this.$message.success('铸造成功!')

      this.afterCreate()

    },
    addressFormat(value) {
      if (!value) return '0x00...0000'
      if (value.length > 8) {
        return `${value.substring(0, 4)}****${value.substring(value.length - 4)}`
      }
      return value
    },
    getTokenList() {
      const _this = this

      fetchDisplay(this.address, {}).then((result) => {
        // console.log(result)
        const myNftsList = result.transactions
        // 这里只筛选721和1155的合约地址
        const contractList = []
        for (const iterator of myNftsList) {
          if (iterator.type == 'ERC-1155' || iterator.type == 'ERC-721') {
            const isExit = contractList.some(
              (value) => value.contractAddress == iterator.contractAddress
            )
            if (isExit == false) {
              contractList.push(iterator)
            }
          }
          continue
        }
        if (this.$route.query.contractAddress) {
          const newMap = {}
          if (this.$route.query.defaultV.indexOf('721') == -1) {
            newMap.type = 'ERC-1155'
          }
          else {
            newMap.type = 'ERC-721'
          }

          newMap.contractAddress = this.$route.query.contractAddress
          newMap.name = '新创建合约,请进行首次NFT创建'
          newMap.symbol = '新创建合约'
          contractList.push(newMap)
        }
        this.contractList = contractList
        this.radioVal = contractList[0]
      })
    },

    handleRemove(file) {
      console.log(file)
      this.fileList = []
      this.hideUpload = this.fileList.length >= this.limitCount
    },

    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },

    handleDownload(file) {
      console.log(file)
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
    this.address = await storage.getAddress(storage.getHighestWalletVersion())
    this.getTokenList()
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
