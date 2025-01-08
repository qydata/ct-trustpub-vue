<template>
  <div>
    <Header/>

    <TrueAndFalsePublicityModal
      :close="closeTruePublicityModal"
      :visible="true" v-if="showTrueAndFalsePublicityModal"
      :p_type="p_type"
      :publicity="publicity"
    />

    <AccountPanel/>
    <v-container>
      <v-switch
        v-model="hideFalsePublicitys"
        color="primary"
        label="只显示人工订单"
        @change="updateHideFalsePublicitys"
      />

      <PublicityTable
        :hideFalsePublicitys="hideFalsePublicitys"
        :limit="limit"
        :receiveMetadata="onPublicitysUpdate"
        :page="currentPage"
        :sortable="true"
        :openTrueAndFalsePublicityModal="openTrueAndFalsePublicityModal"
      />

    </v-container>
  </div>
</template>

<script>
import Header from '@/components/Header'
import TrueAndFalsePublicityModal from '@/components/publicity/TrueAndFalsePublicityModal'
import PublicityTable from '@/components/PublicityTable'

const ethers = require('ethers')
import AccountPanel from '@/components/AccountPanel'
import {InfoFilled, Connection, EditPen, Menu} from '@element-plus/icons-vue'
import {ArrowDownIcon, ArrowUpIcon, ClipboardCopyIcon} from '@heroicons/vue/outline'
import {setCardList, setWalletAddress} from '../utils/storage'

export default {
  name: 'ViewStaking',
  data: function () {
    return {
      showTrueAndFalsePublicityModal: false,
      publicity: null,
      p_type: false,
      metadata: {totalCount: 0},
      limit: 20
    }
  },
  components: {
    Header,
    AccountPanel,
    PublicityTable,
    TrueAndFalsePublicityModal
  },
  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    hideFalsePublicitys() {
      return this.$route.query.hideFalsed === '1' || false
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.metadata.totalCount / this.limit))
    }
  },
  mounted() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.lock)
    }
  },
  methods: {

    lock(accounts) {
      const [ethAddress] = accounts
      if (ethAddress === undefined) {
        this.connectError = 'No Ethereum address found.'
        this.connectStatus = ''
        return
      }
      if (ethAddress === this.ethAddress) return

      this.$store.dispatch('forget')
      this.$store.commit('lock')
      this.$router.push('/')
    },
    closeTruePublicityModal() {
      this.publicity = null
      this.showTrueAndFalsePublicityModal = false
    },
    onPublicitysUpdate(metadata) {
      this.metadata = metadata
    },
    openTrueAndFalsePublicityModal(publicity, p_type) {
      this.publicity = publicity
      this.p_type = p_type
      this.showTrueAndFalsePublicityModal = true
    },
    updateHideFalsePublicitys() {
      const hideFalsed = !this.hideFalsePublicitys ? 1 : undefined
      const query = {...this.$route.query, hideFalsed}
      this.$router.replace({query})
    }
  },
  watch: {
    metadata() {
      const numRegEx = /^[-+]?\d*$/
      if (this.$route.query.page) {
        if (this.$route.query.page < 1 || !numRegEx.test(this.$route.query.page)) {
          this.$router.replace({query: {...this.$route.query, page: 1}})
        }
      }
      // eslint-disable-next-line max-len
      if (this.currentPage > this.lastPage) this.$router.replace({query: {...this.$route.query, page: this.lastPage}})
    }
  },
  setup() {
    return {ArrowUpIcon, ArrowDownIcon, Connection, ClipboardCopyIcon, EditPen, InfoFilled, Menu}
  }
}
</script>

<style scoped>
</style>

