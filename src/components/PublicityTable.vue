<template>
  <v-data-table
    :headers="headers"
    :items="publicitys"
    item-value="id"
    :loading="loading"
    no-data-text="暂无数据"
    loading-text="正在加载请稍候..."
    class="elevation-1"
  >
    <template v-slot:item.id="{ item }">
      <v-tooltip :text="item.id" location="top">
        <template v-slot:activator="{ props }">
          <span v-bind="props" class="">
          {{ truncateString(item.id, 10) }}
        </span>
        </template>
      </v-tooltip>
      <br/>
      <v-tooltip :text="item.transactionHash" location="top">
        <template v-slot:activator="{ props }">
          <span v-bind="props" class="">
            <v-btn @click="explorerTxUrl(item)" size="small" variant="text">
          {{ truncateString(item.transactionHash, 10) }}
            </v-btn>
        </span>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:item._chainpayOrder_trues="{ item }">
      <v-tooltip :text="item._chainpayOrder_trues.toString()" location="top">
        <template v-slot:activator="{ props }">
          <span v-bind="props" class="text-green-500">
          {{ item._chainpayOrder_trues.length }}
        </span>
        </template>
      </v-tooltip>
      <br/>
      <v-tooltip :text="item._chainpayOrder_falses.toString()" location="top">
        <template v-slot:activator="{ props }">
          <span v-bind="props" class="text-red-500">
          {{ item._chainpayOrder_falses.length }}
        </span>
        </template>
      </v-tooltip>
    </template>

    <template v-slot:item._chainpayOrder_state="{ item }">
      <v-chip v-if="item._chainpayOrder_state==0"
              size="small"
              color="default" variant="tonal" rounded>
        待确认
      </v-chip>
      <v-chip v-else-if="item._chainpayOrder_state ==1"
              size="small" color="yellow" variant="tonal" rounded>
        等待人工
      </v-chip>
      <v-chip v-else-if="item._chainpayOrder_state ==2"
              size="small" color="green" variant="tonal" rounded>
        交易成功
      </v-chip>
      <v-chip v-else-if="item._chainpayOrder_state ==3"
              size="small" color="red" variant="tonal" rounded>
        交易失败
      </v-chip>
    </template>

    <template v-slot:item._chainpayOrder_createAt="{ item }">
      {{ formatDate(item._chainpayOrder_createAt) }}
      <br/>
      {{ formatDate(item._chainpayOrder_updateAt) }}
    </template>

    <template v-slot:item._state="{ item }">
      <div class="py-1">
        <v-btn
          :disabled="item._chainpayOrder_state != 0"
          size="small"
          color="green"
          @click="openModal(true,item)"
        >
          赞成
        </v-btn>
        <div class="h-1"/>
        <v-btn
          :disabled="item._chainpayOrder_state != 0"
          color="red"
          size="small"
          @click="openModal(false,item)"
        >
          反对
        </v-btn>
      </div>
    </template>

    <template v-slot:bottom>
      <div class="text-center pt-2">
        <v-pagination
          :model-value="page"
        ></v-pagination>
      </div>
    </template>
  </v-data-table>
</template>

<script>
/*global process*/

import {chainpayOrderEvents} from '@/services/userService'
import {mapState} from 'vuex'

const moment = require('moment')

const stakesRefreshInterval = 5 * 1000

export default {
  name: 'PublicitysTable',
  data: function () {
    return {
      loaded: false,
      loading: false,
      metadata: null,
      publicitys: [],
      iPublicitys: null,
      headers: [
        {sortable: false, minWidth: '150px', align: 'center', title: '订单号/交易Hash', key: 'id'},
        {sortable: false, minWidth: '100px', align: 'center', title: '赞成/反对', key: '_chainpayOrder_trues'},
        {sortable: false, align: 'center', title: '状态', key: '_chainpayOrder_state'},
        {
          sortable: false,
          align: 'center',
          minWidth: '180px',
          title: '(创建/更新)时间',
          key: '_chainpayOrder_createAt'
        },
        {sortable: false, minWidth: '80px', align: 'center', title: '金额', key: '_chainpayOrder_value'},
        {sortable: false, align: 'center', title: '操作 ', key: '_state'}
      ]
    }
  },
  components: {},
  props: [
    'hideFalsePublicitys',
    'limit',
    'page',
    'receiveMetadata',
    'sortable',
    'openTrueAndFalsePublicityModal'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
    }
  },
  mounted() {
    this.updatePublicitys()
    // initiate polling
    this.iPublicitys = setInterval(() => {
      this.updatePublicitys()
    }, stakesRefreshInterval)
  },
  unmounted() {
    clearInterval(this.iPublicitys)
  },
  methods: {
    openModal(action, item) {
      return this.openTrueAndFalsePublicityModal(item, action)
    },
    formatDate(timestamp) {
      if (timestamp == 0) {
        return 0
      }
      else {
        const date = moment.unix(timestamp)
        return date.format('YYYY-MM-DD HH:mm:ss')
        // "2023-08-17 16:00:00"
      }
    },
    explorerTxUrl(item) {
      window.open(`${process.env.VUE_APP_EXPLORER_URL}/tx/${item.transactionHash}`)
    },
    truncateString(input, length) {
      // 检查输入是否有效
      if (typeof input !== 'string') {
        throw new Error('The first argument must be a string.')
      }
      if (typeof length !== 'number' || length < 0) {
        throw new Error('The second argument must be a non-negative number.')
      }

      // 截取字符串并添加省略号
      return input.slice(0, length) + '...'
    },

    async updatePublicitys() {
      this.loading = true
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url
      const options = {
        limit: this.limit,
        page: this.page
      }
      if (this.hideFalsePublicitys) options.hideFalse = 1

      console.log(options)
      const publicitys = await chainpayOrderEvents(options.page - 1, options.limit, options.hideFalse)
      console.log(publicitys)
      if (typeof publicitys === 'string') {
        // 请求出错
      }
      else {
        this.publicitys = publicitys.chainpayOrderEvents

        this.receiveMetadata(publicitys)
        this.loaded = true
        this.loading = false
      }

    },
    updateSorting(newSortQuery) {
      const query = {...this.$route.query, sort: newSortQuery}
      if (!newSortQuery) delete query.sort
      this.$router.replace({query})
    }
  },
  watch: {
    page() {
      this.updatePublicitys()
    },
    sortQuery() {
      this.updatePublicitys()
    }
  }
}
</script>

<style scoped>
</style>
