<template>
  <span class="amount">
    <span class="value" v-html="formattedValue"/>
    <span v-if="currency && sub" class="currency">{{ currency }}</span>
    <span v-else-if="currency" class="currency">{{ currency }}</span>
  </span>
</template>

<script>
const ethers = require('ethers')
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Amount',
  props: {
    currency: String,
    decimalPlaces: Number,
    short: Boolean,
    sub: Boolean,
    value: [Number, String]
  },
  computed: {
    isCT() {
      // if currency is not specified, we assume CT
      return this.currency === 'CT' || this.currency === '' || this.currency === undefined
    },
    formattedValue() {
      if (this.value === undefined) return '...'
      if (isNaN(this.value)) return '&mdash;'
      if (typeof this.value === 'string') {
        return Number(this.value).toFixed(this.decimalPlaces || 6)
      }
      if (this.isCT && !this.short) {
        // return ethers.utils.formatEther(this.value)
        return this.value
      }
      return this.value.toLocaleString('en-US', {maximumFractionDigits: this.decimalPlaces || 6})
    }
  }
}
</script>
