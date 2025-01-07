<template>
  <tr>
    <td data-title="名称:">
      <span class="monospace lg:font-sans lg:inline-block text-black">
        {{ item.token.name }}
      </span>
    </td>

    <td data-title="符号:" :title="item.token.symbol">
        <span class="monospace lg:inline-block text-black">
          {{ item.token.symbol }}
        </span>
    </td>

    <td data-title="余额:" class="from-to" :title="item.value">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block text-black">
            {{ item.value }}
          </span>
      </span>
    </td>
    <!--    <td data-title="To:" class="from-to" :title="JSON.stringify(item.metadata)">-->
    <!--      <span>-->
    <!--        <span class="icon-wrap"></span>-->
    <!--          <span class="monospace lg:inline-block text-black">-->
    <!--            {{ item.metadata }}-->
    <!--          </span>-->
    <!--      </span>-->
    <!--    </td>-->
    <td data-title="类型:" class="from-to" :title="item.token.type">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block text-black">
            {{ item.token.type }}
          </span>
      </span>
    </td>
    <td data-title="TokenID:" class="from-to" :title="item.token_id">
      <span>
        <span class="icon-wrap"></span>
        <a :href="explorerIdUrl" target="_blank" rel="noreferrer">
          <span class="monospace lg:inline-block text-black">
            {{ item.token_id }}
          </span>
        </a>
      </span>
    </td>

    <td data-title="操作:">
      <v-btn type="success" @click="sendNft(item)">发送</v-btn>
    </td>
  </tr>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'NftTableItem',
  data() {
    return {
      modal: ''
    }
  },
  props: [
    'item',
    'sendNft'
  ],
  components: {
  },
  computed: {
    ...mapState(['address']),
    date() {
      return new Date(this.item.timestamp * 1000).toLocaleString()
    },
    explorerIdUrl() {
      return `https://ctblock.cn/token/${this.item.contractAddress}/instance/${this.item.id}/token-transfers`
    },
    sent() {
      return this.item.sender === this.item.recipient || this.address === this.item.sender
    }
  },
  methods: {}
}
</script>

<style scoped>
</style>
