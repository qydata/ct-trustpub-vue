<template>
  <div>
    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="success">


      <v-card title="授权获取钱包地址">
        <v-card-item
          title="钱包地址"
          :subtitle="address"
        >
          <template v-slot:append>

            <v-btn variant="text"
                   @click="generateWallet"
                   :icon="RefreshIcon"
            >
            </v-btn>
            <v-btn variant="text"
                   v-if="canCopy" :icon="ClipboardCopyIcon"
                   @click="copyToClipboard(address)"
            >
            </v-btn>
          </template>
        </v-card-item>
        <v-form ref="myForm">
          <v-card-item
            title="钱包连接地址"
          >
            <v-text-field
              v-model="wcCopyPasteLink"
              :rules="wcCopyPasteLinkRules"
              autocomplete="off"
              label="输入 dApp URI*"

              type="text"
              required
              clearable/>

          </v-card-item>
        </v-form>
        <v-card-item>
          <v-row>
            <v-col cols="6">
              <v-btn rounded="xl" block size="x-large"
                     variant="tonal" @click="rejectFun">拒绝
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn rounded="xl" block size="x-large"
                     @click="beginHandshake">连接 dApp
              </v-btn>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>

    </v-dialog>
  </div>
</template>

<script>
import {ClipboardCopyIcon} from '@heroicons/vue/outline'
import ModalInter from '../ModalInter'
// Vue Components
import {mapState} from 'vuex'

export default {
  name: 'InterSendModal',
  components: {
    ClipboardCopyIcon,
    ModalInter
  },
  props: {
    close: Function,
    displayUri: String,
    onSuccess: Function,
    onReject: Function,

    item: {
      type: Object,
      default: () => ({
        type: 'CT',
        balance: 0
      })
    }
  },
  data() {
    return {
      canCopy: !!navigator.clipboard,
      success: true,
      wcCopyPasteLink: '',
      wcCopyPasteLinkRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        }
      ]
    }
  },
  validations() {
    return {}
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce', 'wcConnectorSession']),
    walletConnectConnected() {
      return !!(this.wcConnectorSession && (this.wcConnectorSession.connected || this.wcConnectorSession.sessionData))
    }
  },
  watch: {},
  mounted() {
    if (this.displayUri != '') {
      this.wcCopyPasteLink = this.displayUri
      this.beginHandshake()
    }
  },
  methods: {
    resetWeb3ConnectionPage() {
      this.wcCopyPasteLink = ''
    },

    async initPairing() {
      try {
        await this.$store.dispatch('web3Connections/walletConnectPair', {
          uri: this.wcCopyPasteLink
        })
      } catch (err) {
        this.$message.error(err.message, 'Error Pairing')
      } finally {
        this.resetWeb3ConnectionPage()
      }
    },
    async beginHandshake() {
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      this.initPairing()
    },
    rejectFun() {
      this.onReject()
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },
    cancel() {
      this.reset()
    }
  },
  setup() {
    return {
      ClipboardCopyIcon
    }
  }
}
</script>

<style scoped>
</style>
