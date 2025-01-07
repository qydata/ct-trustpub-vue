<template>
  <table>
    <thead class="hidden lg:table-header-group">
      <tr v-if="sortable">
        <TableHeader width="19%" header="ID" :sortQuery="sortQuery"
          sortParam="id" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="19%" header="Hash" :sortQuery="sortQuery"
          sortParam="hash" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="26%" header="Node" :sortQuery="sortQuery"
          sortParam="device" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="8%" header="Type" :sortQuery="sortQuery"
          sortParam="type" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="8%" header="Status" :sortQuery="sortQuery"
          sortParam="sortStatus" :onSortingUpdate="updateSorting"
        />
        <TableHeader class="amount-col" width="10%" header="Amount CT" :sortQuery="sortQuery"
          sortParam="amount" :onSortingUpdate="updateSorting"
        />
        <th width="10%">&nbsp;</th>
      </tr>
      <tr v-else>
        <th width="19%">ID</th>
        <th width="19%">Hash</th>
        <th width="26%">Node</th>
        <th width="8%">Type</th>
        <th width="8%">Status</th>
        <th class="amount-col" width="10%">Amount CT</th>
        <th width="10%">&nbsp;</th>
      </tr>
    </thead>
    <tbody v-if="stakes.length">
      <StakesTableItem
        v-for="item in stakes"
        :key="item.id"
        :item="item"
        :openReleaseStakeModal="openReleaseStakeModal"
        :openUnlockStakeModal="openUnlockStakeModal"
      />
    </tbody>
    <tbody v-else-if="!loaded && loading">
      <td colspan="7" class="block w-full text-center bg-white lg:table-cell py-35">
        正在载入...
      </td>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="7" class="block w-full text-center bg-white lg:table-cell py-35">
          No stakes.
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
/*global process*/

import * as index from '@edge/index-utils'
import StakesTableItem from '@/components/StakesTableItem'
import TableHeader from '@/components/TableHeader'
import { mapState } from 'vuex'

const stakesRefreshInterval = 5 * 1000

export default {
  name: 'StakesTable',
  data: function () {
    return {
      loaded: false,
      loading: false,
      metadata: null,
      stakes: [],
      iStakes: null
    }
  },
  components: {
    StakesTableItem,
    TableHeader
  },
  props: [
    'hideReleasedStakes',
    'limit',
    'page',
    'receiveMetadata',
    'sortable',
    'openReleaseStakeModal',
    'openUnlockStakeModal'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
    }
  },
  mounted() {
    this.updateStakes()
    // initiate polling
    this.iStakes = setInterval(() => {
      this.updateStakes()
    }, stakesRefreshInterval)
  },
  unmounted() {
    clearInterval(this.iStakes)
  },
  methods: {
    async updateStakes() {
      this.loading = true
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url
      const sortQuery = this.$route.query.sort ? `${this.$route.query.sort},-created` : '-created'
      const options = {
        limit: this.limit,
        page: this.page,
        sort: sortQuery
      }
      if (this.hideReleasedStakes) options.hideReleased = 1

      const stakes = await index.stake.stakes(
        process.env.VUE_APP_INDEX_API_URL,
        this.address,
        options
      )
      this.stakes = stakes.results
      this.receiveMetadata(stakes.metadata)
      this.loaded = true
      this.loading = false
    },
    updateSorting(newSortQuery) {
      const query = { ...this.$route.query, sort: newSortQuery }
      if (!newSortQuery) delete query.sort
      this.$router.replace({ query })
    }
  },
  watch: {
    page() {
      this.updateStakes()
    },
    sortQuery() {
      this.updateStakes()
    }
  }
}
</script>

<style scoped>
</style>
