<template>
  <div style="">
    <Header/>
    <div class="chat-ui">

      <h2>
        当前共有 <span style="color: #4ecd5f;">{{ total }}</span> 个消息
      </h2>

      <el-row :gutter="0" style="height: 700px; background: white">
        <el-col :span="8">
          <div class="flex flex-col w-full px-12 pt-12 pb-12  bg-white  rounded-b">
            <div
              :class="{
                  'account-panel__address flex flex-col flex-1 px-12 pt-12  rounded point': true,
                  'bg-opacity-60': true,
                }"
              @click="openNewChat"
            >
              <div>
                <v-btn type="success" circle>
                  <el-icon>
                    <Plus/>
                  </el-icon>
                </v-btn>

              </div>
            </div>
            <el-divider/>
            <div class="panelLeft">
              <div
                v-for="(msg, index) in messageList"
                :class="{
                  'account-panel__address flex  px-12 pt-12  rounded-b point': true,
                  'bg-black': true,
                  'pb-12': true,
                  'bg-opacity-60': true,
                  'bg-opacity-100': index == indexItem
                }"
                @click="getJobChatDetail(msg, index)"
                :key="index"
                style="height: 75px;"
              >

                <div style="display: flex;width: 100%;height: 80px;">
                  <div class="chatAva">
                    <img :src="msg.avaCcanvas" alt="">
                  </div>
                  <div style="flex: 1;line-height: 50px;text-align: left;">
                    <span>{{ addressFormat(msg.reced, 12) }}</span>
                  </div>
                  <div class="timeClass">
                    {{ formatDate(dateTime - ((blockNumber - msg.blockNumber) * 5 * 1000)) }}
                  </div>
                  <div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" style="height: 100%;"/>
        </el-col>
        <el-col :span="14">
          <div class="contents">
            <div class="chat-messages">
              <div v-if="messages.length == 0" class="newChatRightPanel">
                <h2>欢迎来到去中心化聊天</h2>
                <div>
                  <v-btn type="success" size="large" @click.native="openNewChat">
                    <el-icon :size="20">
                      <Plus/>
                    </el-icon>
                    开始新的聊天
                  </v-btn>
                </div>
              </div>
              <div v-for="(message, index) in messages" :key="index">
                <div v-if="message.isMe">
                  <div class="message-me">
                    <div style="display: flex;">
                      <div style="flex: 1;color:#818181;line-height: 26px;">
                        {{ formatDate(message.datetime) }}
                      </div>

                      <!--                    <button-->
                      <!--                      shape="circle"-->
                      <!--                      size="small"-->
                      <!--                      :class="-->
                      <!--                              'button button&#45;&#45;' +-->
                      <!--                                (message.isRead ? 'success' : 'error')-->
                      <!--                            "-->
                      <!--                    >-->
                      <!--                      {{ message.isRead ? '已读' : '未读' }}-->
                      <!--                    </button>-->

                    </div>
                    <div>
                      <v-btn
                        type="success"
                        :class="
                              'button button--' +
                                (message.isRead ? 'success' : 'error')
                            "

                        @click="dencPass(message, message.text)"
                        v-show="isEncText(message.text)"
                        shape="circle"
                        plain
                      >
                        查看
                      </v-btn>
                      <p v-show="!isEncText(message.text)">{{ message.text }}</p>
                    </div>

                  </div>
                </div>
                <div v-else>
                  <div>
                    <p class="message-nickname-other">
                      {{ addressFormat(publisher) }}
                    </p>
                    <div class="message-other">

                      <div style="display: flex;">
                        <div style="flex: 1;color:#818181;line-height: 26px;">
                          {{ formatDate(message.datetime) }}
                        </div>

                        <!--                    <button-->
                        <!--                      shape="circle"-->
                        <!--                      size="small"-->
                        <!--                      :class="-->
                        <!--                              'button button&#45;&#45;' +-->
                        <!--                                (message.isRead ? 'success' : 'error')-->
                        <!--                            "-->
                        <!--                    >-->
                        <!--                      {{ message.isRead ? '已读' : '未读' }}-->
                        <!--                    </button>-->

                      </div>


                      <div>
                        <button
                          type="success"
                          @click="dencPass(message, message.text)"
                          v-show="isEncText(message.text)"
                          shape="circle"
                          :class="
                                'button button--' +
                                  (message.isRead ? 'success' : 'error')
                              "
                          size="small"
                        >
                          查看
                        </button>
                        <!--                      <button-->
                        <!--                        :type="message.isRead ? 'success' : 'error'"-->
                        <!--                        :class="-->
                        <!--                                'button button&#45;&#45;' +-->
                        <!--                                  (message.isRead ? 'success' : 'error')-->
                        <!--                              "-->
                        <!--                        shape="circle"-->
                        <!--                        size="small"-->
                        <!--                      >-->
                        <!--                        {{ message.isRead ? '已读' : '未读' }}-->
                        <!--                      </button>-->
                        <p v-show="!isEncText(message.text)">{{ message.text }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="chat-input" v-if="messages.length != 0">

              <div style="flex: 1;">
                <el-input
                  size="large"
                  v-model="newMessage"
                  :rows="4"
                  type="textarea"
                  placeholder="在这里输入你要发送的消息"
                />

              </div>
              <div style="display: flex;align-self: end;">
                <v-btn
                  style="margin-left: 10px"
                  type="success"
                  @click.native="sendMessagePass"
                >
                  <el-icon :size="24">
                    <Promotion/>
                  </el-icon>
                </v-btn>
              </div>
              <!--              <input-->
              <!--                v-model="newMessage"-->
              <!--                size="large"-->
              <!--                style="flex: 4"-->
              <!--                placeholder="在这里输入你要发送的消息"-->
              <!--              />-->

            </div>
          </div>
        </el-col>
        <el-col :span="1">
        </el-col>
      </el-row>
      <NewChatModal
        :afterCreate="chatAfter"
        :close="closeModal"
        :visible="true" v-if="modal == 'newChat'"
      />
      <InPasswordModal
        :afterCreate="dencMsg"
        :close="closeModal"
        :visible="true" v-if="modal == 'inPasswordModalDenc'"
      />
      <InPasswordModal
        :afterCreate="sendMessagePassCall"
        :close="closeModal"
        :visible="true" v-if="modal == 'inPasswordModalSend'"
      />
      <LoadingModal
        :afterCreate="sendMessagePassCall"
        :close="closeModal"
        :visible="loading"
      />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import InPasswordModal from '@/components/index/InPasswordModal'
import LoadingModal from '@/components/index/LoadingModal'
import NewChatModal from '@/components/index/NewChatModal'
import {queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import {Plus, Promotion} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import ipfsAPI from 'ipfs-api'
import {mapState} from 'vuex'
import {getWalletName} from '../utils/storage'

const ABI_const = require('@/contract/ABI_const.js')
const ethUtil = require('ethereumjs-util')
const {encryptWithPublicKey, decryptWithPrivateKey} = require('eth-crypto')
const ethers = require('ethers')
const GlobalConfig = require('@/config/GlobalConfig.json')
const Web3 = require('web3')
const web3 = new Web3('http://ctblock.cn/blockChain')
const ipfsNode = ipfsAPI(GlobalConfig.IPFS[0])
const {
  contract_call_override
} = require('../contract/ChainCall')
const blockies = require('ethereum-blockies') // 引入库

export default {
  title: '区块链邮件',
  name: 'ChatPanel',
  props: ['view'],
  components: {
    Plus,
    Promotion,
    Header,
    NewChatModal,
    InPasswordModal,
    LoadingModal
  },
  computed: mapState(['address', 'balance', 'cnyBalance']),
  data() {
    return {
      id: '',
      modal: 'loading',
      addressRQ: '',
      addressRP: '',
      newMessage: '',
      walletName: '',
      canCopy: !!navigator.clipboard,
      item: {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      },
      order: {},
      messageList: [],
      total: 0,
      publisher: '',
      messages: [],
      pubKey: null,
      pubKeyMe: null,
      password: '',
      denc: {
        msg: '',
        text: ''
      },
      indexItem: -1,
      loading: false,
      blockNumber: 0,
      dateTime: 0
    }
  },
  watch: {
    async address() {
      this.walletName = await getWalletName()
    },
    balance(newVal, oldVal) {
      // console.log('balance newVal', newVal)
      this.item.balance = newVal
    }
  },
  filters: {},
  created() {

  },
  async mounted() {
    this.walletName = await getWalletName()
    this.blockNumber = window.localStorage.getItem('blockNumber')
    this.dateTime = new Date().getTime()
    console.log('this.blockNumber', this.blockNumber)
    this.getJobchats()

  },
  methods: {
    isEncText(val) {
      const text = JSON.stringify(val)
      if (text.indexOf('ephemPublicKey') != -1) {
        return true
      }
      else {
        return false
      }
    },
    generateAvatar(addr) {

      const img = blockies.create({ // 生成头像
        seed: addr,// 要生成头像的地址
        size: 8,
        scale: 16
      }).toDataURL('image/png')
      return img
    },
    processMsg(message, index) {
      // console.log(message)
      // console.log(index)

      let oText
      if (message.isMe) {
        oText = message.messageRQ
      }
      else {
        oText = message.messageRP
      }

      if (message.pubKeyRP == undefined) {
        return oText
      }

      // 解密
      // 使用私钥解密信息
      // const privateKey = await storage.getPrivateKey(this.password)
      // let decText = await decryptWithPrivateKey(privateKey, oText)
      return oText
    },
    formatDate(date_time_str) {

      // let date_time_str = '2023-05-09 07:10:37.000000Z'
      const formattedDate = dayjs(date_time_str).format('YYYY/MM/DD HH:mm:ss')
      return formattedDate
    },
    addressFormat(value, num) {
      if (!num) {
        num = 8
      }
      if (!value) return '0x00...0000'
      if (value.length > num) {
        return `${value.substring(0, num / 2)}****${value.substring(
          value.length - num / 2
        )}`
      }
      return value
    },
    chatAfter(toAddress, firstMessage, password) {
      // 发送明文消息
      console.log(toAddress, firstMessage, password)
      // 加密信息(我的公钥)
      this.sendMessage(toAddress, firstMessage, password, true)
      const that = this
      window.setTimeout(() => {
        that.getJobchats()
      }, 10000)
      this.modal = ''
    },
    closeModal() {
      this.modal = ''
    },
    dencPass(msg, text) {
      this.denc.msg = msg
      this.denc.text = text
      this.modal = 'inPasswordModalDenc'
    },
    async dencMsg(password) {
      this.modal = ''
      const msg = this.denc.msg
      const text = this.denc.text
      console.log('msg', msg)
      console.log('text', JSON.parse(JSON.stringify(text)))
      if (msg.denText == '') {
        const privateKey = await storage.getPrivateKey(password)
        const customHttpProvider = new ethers.providers.JsonRpcProvider(
          this.$store.state.config.blockchain.baseURL,
          {
            chainId: 27
          }
        )
        const wallet = new ethers.Wallet(privateKey, customHttpProvider)

        console.log(wallet.privateKey)
        msg.denText = await decryptWithPrivateKey(privateKey, text)
        msg.text = msg.denText
        window.localStorage.setItem(msg.ori.transactionHash, true)
        msg.isRead = true
      }
      else {
        msg.text = msg.denText
      }
    },
    sendMessagePass() {
      // publisher, newMessage,password,false
      // 判断是否选中了发送列表
      this.modal = 'inPasswordModalSend'
      // sendMessagePass(publisher, newMessage,password,false)
    },
    async sendMessagePassCall(password) {
      this.modal = ''
      this.sendMessage(this.publisher, this.newMessage, password, false)
    },
    async sendMessage(toAddress, firstMessage, password, isFirst) {
      console.log('sendMessage')
      const that = this

      this.loading = true

      // 上传ipfs
      // 加密信息
      // 公钥加密
      let publicKey = await storage.getPublicKey(
        storage.getHighestWalletVersion()
      ) // 公钥
      // 使用公钥加密信息
      publicKey = ethUtil.stripHexPrefix(publicKey)
      const encMsgRQ = await encryptWithPublicKey(publicKey, firstMessage)
      // 使用对方公钥加密消息
      let encMsgRP
      if (isFirst || this.pubKey == null) {
        encMsgRP = firstMessage
      }
      else {
        encMsgRP = await encryptWithPublicKey(that.pubKey, that.newMessage)
      }

      console.log('encMsgRQ', encMsgRQ)
      console.log('encMsgRP', encMsgRP)
      // if (encMsgRQ.substring(0, 6) == 'Error:') {
      //   console.log('加密消息失败')
      //   return
      // }
      // if (encMsgRP.substring(0, 6) == 'Error:') {
      //   console.log('加密消息失败')
      //   return
      // }
      // 这里为了方便自己查阅消息, 也要使用
      // 自己的公钥加密一份数据, 这样自己使用私钥就可以查看自己发送的消息
      const message = {
        messageRQ: encMsgRQ,
        pubKeyRQ: publicKey,
        messageRP: encMsgRP,
        pubKeyRP: this.pubKey,
        datetime: new Date().getTime()
      }

      const responseRet = await ipfsNode
        .add(Buffer.from(JSON.stringify(message), 'utf-8'))
        .then(resp => ({err: null, data: resp}))
        .catch(err => {
          console.trace(err)
          return {err: err, data: null}
        })

      console.log(responseRet.data[0].path)

      // 上传链
      const jobContract = GlobalConfig.JOBCONTRACT_ADDRESS
      const overrride = {
        from: this.address
      }

      // 计算房间号码
      // 对比两个地址的大小
      const privateKey = await storage.getPrivateKey(password)

      const customHttpProvider = new ethers.providers.JsonRpcProvider(
        this.$store.state.config.blockchain.baseURL,
        {
          chainId: 27
        }
      )
      const param = [toAddress, responseRet.data[0].path]
      const wallet = new ethers.Wallet(privateKey, customHttpProvider)
      const tx = await contract_call_override(
        // let resp = await contract_estimateGas_call(
        ethers,
        wallet,
        jobContract,
        ABI_const['JobContract'].abi,
        'sendMessage',
        customHttpProvider,
        param,
        overrride
      )
      console.log(tx)
      if (tx.data == null) {
        this.$message.error('发生错误' + tx.err.reason)
        this.loading = false
        return
      }
      console.log('tx:', tx)
      await tx.data.wait()
      console.log(tx.data.hash)
      if (tx.data != null) {
        this.$message.success('发送成功')
        // 这里切换最新的聊天列表
        that.getJobChat()
        that.newMessage = ''
      }
      else {
        this.$message.error('发送失败')
      }
      this.loading = false
    },
    getJobChatDetail(msg, index) {

      this.loading = true
      // 已经存在对话
      console.log(msg.topics[0])
      // 这里不用区分谁是谁, 会自动排序计算房间号
      // 复制 publisher
      const addr1 = this.hexStripZeros(msg.topics[1])
      const addr2 = this.hexStripZeros(msg.topics[2])
      if (this.isMeFun(addr1)) {
        this.publisher = addr2
      }
      if (this.isMeFun(addr2)) {
        this.publisher = addr1
      }

      this.addressRQ = addr1
      this.addressRP = addr2
      this.indexItem = index
      this.getJobChat()
    },
    openNewChat() {
      this.modal = 'newChat'
    },
    hexStripZeros(val) {
      return ethers.utils.hexStripZeros(val)
    },

    isMeFun(address) {
      if (this.address.toLowerCase() == address.toLowerCase()) {
        return true
      }
      else {
        return false
      }
    },
    async getJobChat() {
      const that = this

      const topic = ethers.utils.id(
        // "jobChatItem(address,address)"
        'jobChat(bytes32,address,address,string)'
      )

      // console.log('===', that.address)
      // console.log('===', ethers.utils.hexZeroPad(that.address, 32))
      const toBlock = window.localStorage.getItem('blockNumber')
      const fromBlock = Number(toBlock) - 300000
      const _from = this.address
      const _to = this.publisher
      // 计算房间号码
      // 对比两个地址的大小

      const addresses = [this.addressRP, this.addressRQ]

      addresses.sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) {
          return -1
        }
        if (a.toLowerCase() > b.toLowerCase()) {
          return 1
        }
        return 0
      })

      console.log(addresses)
      const abiCode =
        '0x' +
        web3.utils.stripHexPrefix(addresses[0]) +
        web3.utils.stripHexPrefix(addresses[1])
      const hash = web3.utils.keccak256(abiCode)
      console.log(hash)
      this.id = hash
      // hash = "0x0e11fc7ad4191b6de8b9a13638fd17c99e0cb510c03c7ca71c05adac61b5f106";
      //计算起始区块
      const filter = {
        address: GlobalConfig.JOBCONTRACT_ADDRESS,
        fromBlock: Number(fromBlock), // 1天的数据
        toBlock: Number(toBlock),
        // topics: [topic, ethers.utils.hexZeroPad(that.address, 32)],
        topics: [topic, this.id, null, null]
        // ethers.utils.hexZeroPad(_to, 32)],
        // topics: [topic],
      }
      // that.loading = true;
      const customHttpProvider = new ethers.providers.JsonRpcProvider(
        this.$store.state.config.blockchain.baseURL,
        {
          chainId: 27
        }
      )
      const resp_ret = await customHttpProvider.getLogs(filter).then(result => result)

      console.log(resp_ret)
      const allMessages = resp_ret

      // {id: 2, text: 'Hello!', isMe: true},
      const messages = []
      let noMe = true
      for (const allMessagesKey in allMessages) {
        const obj = allMessages[allMessagesKey]
        // console.log('obj', obj)

        let isMe
        if (
          ethers.utils
            .hexStripZeros(obj.topics[2])
            .toString()
            .toLowerCase() == _from.toLowerCase()
        ) {
          isMe = true
          noMe = false
        }
        else if (
          ethers.utils
            .hexStripZeros(obj.topics[3])
            .toString()
            .toLowerCase() == _from.toLowerCase()
        ) {
          isMe = false
        }
        else {
          that.$router.go(-1)
        }
        let tempObj

        const content = ethers.utils.defaultAbiCoder.decode(
          ['string'],
          obj.data
        )[0]
        let isRead = false
        const isReadTemp = window.localStorage.getItem(obj.transactionHash)
        if (isReadTemp && isReadTemp == 'true') {
          isRead = true
        }
        // ipfs资源获取
        if (content.substring(0, 2) == 'Qm') {
          // 查询ipfs元数据
          const responseRet = await ipfsNode
            .cat(content)
            .then(resp => ({err: null, data: resp}))
            .catch(err => {
              console.trace(err)
              return {err: err, data: null}
            })
          let metaOriData = responseRet.data.toString('utf8')
          metaOriData = JSON.parse(metaOriData)
          console.log(metaOriData)

          tempObj = {
            id: allMessagesKey,
            datetime: metaOriData.datetime,
            messageRP: metaOriData.messageRP,
            messageRQ: metaOriData.messageRQ,
            pubKeyRP: metaOriData.pubKeyRP,
            pubKeyRQ: metaOriData.pubKeyRQ,
            denText: '',
            isRead: isRead,
            isMe: isMe,
            ori: obj
          }
          tempObj.text = this.processMsg(tempObj, allMessagesKey)
          // 对对方公钥赋值
          if (!isMe && this.pubKey == null) {
            this.pubKey = metaOriData.pubKeyRQ
          }
          else if (this.pubKeyMe == null) {
            that.pubKeyMe = metaOriData.pubKeyRP
          }
        }
        else {
          tempObj = {
            id: allMessagesKey,
            text: content,
            isMe: isMe,
            isRead: isRead,
            denText: '',
            ori: obj
          }
        }

        messages.push(tempObj)
        console.log('messages', messages)
      }

      // 没有我的公钥缓存, 将通过metamask获取
      if (noMe && this.pubKeyMe == '') {
        that.pubKeyMe = await storage.getPublicKey(
          storage.getHighestWalletVersion()
        ) // 公钥
      }

      this.messages = messages
      this.loading = false
    },
    async getJobchats() {
      const that = this

      const topic = ethers.utils.id(
        'jobChatItem(address,address)'
        // "jobChat(address,address,string)"
      )

      // console.log('===', that.address)
      // console.log('===', ethers.utils.hexZeroPad(that.address, 32))
      const toBlock = window.localStorage.getItem('blockNumber')
      const fromBlock = Number(toBlock) - 300000
      //计算起始区块

      that.loading = true
      const customHttpProvider = new ethers.providers.JsonRpcProvider(
        this.$store.state.config.blockchain.baseURL,
        {
          chainId: 27
        }
      )
      // 我发出的
      const filter = {
        address: GlobalConfig.JOBCONTRACT_ADDRESS,
        fromBlock: Number(fromBlock), // 1天的数据
        toBlock: Number(toBlock),
        // topics: [topic, ethers.utils.hexZeroPad(that.address, 32)],
        topics: [topic, ethers.utils.hexZeroPad(that.address, 32), null]
        // topics: [topic],
      }
      const resp_ret = await customHttpProvider.getLogs(filter).then(result => result)

      //  我接受的
      const filterR = {
        address: GlobalConfig.JOBCONTRACT_ADDRESS,
        fromBlock: Number(fromBlock), // 1天的数据
        toBlock: Number(toBlock),
        // topics: [topic, ethers.utils.hexZeroPad(that.address, 32)],
        topics: [topic, null, ethers.utils.hexZeroPad(that.address, 32)]
        // topics: [topic],
      }
      const resp_retR = await customHttpProvider
        .getLogs(filterR)
        .then(resultR => resultR)
      that.messageList = resp_ret.concat(resp_retR)
      //
      // that.messageList.unshift({
      //   new: true
      // })
      console.log(that.messageList)

      that.total = this.messageList.length

      for (const msg of this.messageList) {
        let publisher
        const addr1 = this.hexStripZeros(msg.topics[1])
        const addr2 = this.hexStripZeros(msg.topics[2])
        if (this.isMeFun(addr1)) {
          publisher = addr2
          msg.reced = publisher
          msg.send = addr1
        }
        if (this.isMeFun(addr2)) {
          publisher = addr1
          msg.reced = publisher
          msg.send = addr2
        }
        msg.avaCcanvas = this.generateAvatar(publisher)
      }

      that.loading = false
    },

    closeCharge() {
      this.modal = ''
    },
    openPay(order) {
      console.log(order)
      this.order = order
      this.modal = 'pay'
    },
    closePay() {
      this.modal = ''
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },
    async createOnEnter(event) {
      if (event.charCode !== 13) return
      // 修改钱包名称
      await storage.setWalletName(
        this.walletName,
        this.address,
        storage.getHighestWalletVersion()
      )
    },

    openCreateStake() {
      this.modal = 'createStake'
    },
    openDeposit() {
      this.modal = 'deposit'
    },
    async authJudge(oriName) {
      // 查询实名状态
      const address = await storage.getAddress(storage.getHighestWalletVersion())
      queryCert({address: address})
        .then(res => {
          if (res.code !== 200) {
            console.log(res.msg)
          }
          else if (!res.is_cert) {
            const r = confirm(
              '当前账户未进行实名认证, 认证过后才可以进行手续费接收和充值, 点击确认去认证!'
            )
            if (r == true) {
              console.log('You pressed OK!')
              this.modal = 'authBind'
            }
          }
          else {
            this.modal = oriName
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    async openReceive() {
      await this.authJudge('receive')
    },
    openSell() {
      this.modal = 'sell'
    },
    openSend() {
      this.modal = 'send'
    },
    openSwap() {
      this.modal = 'swap'
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
  }
}
</script>

<style scoped>
</style>
