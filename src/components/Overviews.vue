<template>
  <div>

    <div class="transactions-items" v-if="transactions">
      <TransactionsTable :transactions="transactions"/>
    </div>
  </div>
</template>

<script>
import TransactionsTable from '@/components/TransactionsTable'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Overviews',
  components: {
    TransactionsTable
  },
  props: ['transactions'],
  methods: {}
}
</script>

<style scoped>
</style>
