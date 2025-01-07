<template>
  <tr>
    <td data-title="名称:">
      <span class="monospace lg:font-sans lg:inline-block">
        {{ item.name }}
      </span>
    </td>

    <td data-title="符号:" :title="item.symbol">
      <a :href="explorerToAddressUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.symbol }}
        </span>
      </a>
    </td>

    <td data-title="类型:" class="from-to" :title="item.type">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block">
            {{ item.type }}
          </span>
      </span>
    </td>
  </tr>
</template>

<script>
/*global process*/

const ethers = require('ethers')
import {mapState} from 'vuex'

const ABI_const = require('@/contract/ABI_const.js')
export default {
  name: 'ContractTableItem',
  data() {
    return {
      modal: ''
    }
  },
  props: [
    'item'
  ],
  components: {
  },
  computed: {
    ...mapState(['address']),
    date() {
      return new Date(this.item.timestamp * 1000).toLocaleString()
    },
    explorerFromAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.sender}`
    },
    explorerToAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.contractAddress}`
    },
    explorerTxUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/tx/${this.item.hash}`
    },
    isConfirmed() {
      return ((this.item.confirmations || 0) >= 10)
    },
    statusFormatted() {
      if (this.item.pending) return '确认中'
      if (this.item.confirmations === 1) return `${this.item.confirmations} confirmation`
      if (this.item.confirmations < 10) return `${this.item.confirmations} confirmations`
      return '已确认'
    },
    sent() {
      return this.item.sender === this.item.recipient || this.address === this.item.sender
    }
  },
  mounted() {
    // console.log(ABI_const)
  },
  methods: {}
}
</script>

<style scoped>
</style>
