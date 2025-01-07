<template>
  <tr :class="item.pending && 'pending'">

    <td data-title="区块:" :title="item.blockNumber">
        <span class="text-black-100 monospace lg:inline-block">
          {{ item.blockNumber }}
        </span>
    </td>
    <td data-title="交易哈希:" :title="item.hash">
      <a :href="explorerTxUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.hash }}
        </span>
      </a>
    </td>

    <td v-if="sent" data-title="到:" class="from-to"
        :title="item.toAddressHash==null?item.createdContractAddressHash:item.toAddressHash">
      <span>
        <span class="icon-wrap"><ArrowUpIcon class="icon inline-icon icon-red"/></span>
        <a :href="explorerToAddressUrl" target="_blank" rel="noreferrer">
          <span class="text-black-100 monospace lg:inline-block">
            {{ item.toAddressHash == null ? item.createdContractAddressHash : item.toAddressHash }}
          </span>
        </a>
      </span>
    </td>
    <td v-else data-title="从:" class="from-to" :title="item.fromAddressHash">
      <span>
        <span class="icon-wrap"><ArrowDownIcon class="icon inline-icon icon-green"/></span>
        <a :href="explorerFromAddressUrl" target="_blank" rel="noreferrer">
          <span class="monospace lg:inline-block">
            {{ item.fromAddressHash }}
          </span>
        </a>
      </span>
    </td>

    <!--    <td data-title="备忘录:" :title="item.description || 'None'">-->
    <!--      <span class="monospace lg:font-sans lg:inline-block" :class="!item.description && 'text-gray'">-->
    <!--        {{ item.description || 'None' }}-->
    <!--      </span>-->
    <!--    </td>-->

    <td data-title="状态:">
      <span v-if="item.status === 'OK'">
        <span class="mr-1 -mt-2 icon icon-green"><CheckCircleIcon/></span>
        <span class="monospace text-green lg:font-sans">{{ statusFormatted }}</span>
      </span>
      <span v-else-if="item.status === 'ERROR'">
        <span class="mr-1 -mt-2 icon icon-red"><XCircleIcon/></span>
        <span class="monospace lg:font-sans text-gray">{{ statusFormatted }}</span>
      </span>
      <span v-else>
        <span class="mr-1 -mt-2 icon icon-grey"><ClockIcon/></span>
        <span class="monospace lg:font-sans text-gray">{{ statusFormatted }}</span>
      </span>
    </td>

    <td data-title="草田分数量:" class="amount-col" :title="`${sent ? '-' : ''}${formattedAmount}`">
      <span class="monospace  text-black">
        {{ `${sent && formattedAmount < 0 ? '-' : ''}${formattedAmount}` }}
      </span>
    </td>
  </tr>
</template>

<script>
/*global process*/

const ethers = require('ethers')
import {ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, ClockIcon, XCircleIcon} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import {mapState} from 'vuex'

export default {
  name: 'StakesTableItem',
  props: [
    'item'
  ],
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
  },
  computed: {
    ...mapState(['address']),
    date() {
      // return this.item.timestamp
      const formattedDate = dayjs(this.item.timestamp).format('YYYY/MM/DD HH:mm:ss')
      return formattedDate
    },
    explorerFromAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.fromAddressHash}`
    },
    explorerToAddressUrl() {
      if (this.item.toAddressHash == null) {
        return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.createdContractAddressHash}`
      }
      else {
        return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.toAddressHash}`
      }
    },
    explorerTxUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/tx/${this.item.hash}`
    },
    formattedAmount() {
      return ethers.utils.formatEther(this.item.value)
    },
    statusFormatted() {
      if (this.item.status === 'OK') return '确认'
      else if (this.item.status === 'ERROR') return '失败'
      return '确认中'
    },
    sent() {
      return this.item.fromAddressHash.toLowerCase() === this.address.toLowerCase()
    }
  }
}
</script>

<style scoped>
</style>
