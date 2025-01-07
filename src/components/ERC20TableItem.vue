<template>
  <tr class="text-black">
    <td data-title="名称:">
      <span class=" monospace lg:font-sans lg:inline-block">
        {{ item.token.name }}
      </span>
    </td>

    <td data-title="符号:" :title="item.token.symbol">
      <a :href="explorerToAddressUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.token.symbol }}
        </span>
      </a>
    </td>

    <td data-title="余额:" class=" from-to" :title="formattedAmount">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block">
            {{ formattedAmount }}
          </span>
      </span>
    </td>
    <td data-title="类型:" class="from-to " :title="item.token.type">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block">
            {{ item.token.type }}
          </span>
      </span>
    </td>
    <td data-title="精度:" class="from-to " :title="item.token.decimals">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block">
            {{ item.token.decimals === '' ? 0 : item.token.decimals }}
          </span>
      </span>
    </td>

    <td data-title="操作:">
      <v-btn type="success" @click="sendErc20(item)">发送</v-btn>
    </td>
  </tr>
</template>

<script>
const ethers = require('ethers')
import {mapState} from 'vuex'

export default {
  name: 'ERC20TableItem',
  data() {
    return {
      modal: ''
    }
  },
  props: [
    'item',
    'sendErc20'
  ],
  components: {
  },
  computed: {
    ...mapState(['address']),
    date() {
      return new Date(this.item.timestamp * 1000).toLocaleString()
    },
    explorerToAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.token.address}`
    },
    formattedAmount() {
      return Number(ethers.utils.formatUnits(this.item.value, this.item.token.decimals))
    },
    sent() {
      return this.item.sender === this.item.recipient || this.address === this.item.sender
    }
  },
  mounted() {
  },
  methods: {}
}
</script>

<style scoped>
</style>
