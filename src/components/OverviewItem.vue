<template>
  <div class="overview-item">
    <h2 class="overview-item__period h3">{{setting.date}}</h2>

    <div class="transactions-items">
      <div
        v-for="(item, index) in setting.items"
        :key="index"
        :class="['transaction-item', { 'item-active': activeIndex === index }]"
      >
        <div class="transaction-item__heading relative cursor-pointer"  @click="clickHandler(index)">
          <strong class="transaction-item__type">
            <span class="icon">
              <ArrowDownIcon v-if="item.head.type.toLowerCase() === 'received'"/>
              <ArrowUpIcon v-if="item.head.type.toLowerCase() === 'sent'"/>
            </span>
            {{item.head.type}}
          </strong>
          <strong class="transaction-item__amount">
            <span v-if="item.head.type.toLowerCase() === 'sent'">-</span>
              {{ item.head.amount }}
              CT
          </strong>
          <span class="transaction-item__heading-icon">
            <ChevronDownIcon/>
          </span>
        </div>
        <Transition
          @before-enter="beforeEnter"
          @enter="enter"
          @before-leave="beforeLeave"
          @leave="leave"
          @after-leave="afterLeave"
        >
          <div class="transaction-item__slide" v-show="activeIndex === index">
            <div class="transaction-table">
              <table>
                <thead class="hidden lg:table-header-group">
                  <tr>
                    <th width="20%">Date</th>
                    <th width="35%">{{ item.head.type.toLowerCase() === 'sent' ? 'Sent to' : 'Received from'}}</th>
                    <th width="15%">Transaction ID</th>
                    <th width="30%">备忘录</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-title="Timestamp :">
                      {{item.description.date}}
                    </td>
                    <td data-title="Address :">
                      {{ item.description.address }}
                    </td>
                    <td data-title="Transaction ID :">
                      <router-link :to="{name: 'Transaction', params: { id: item.description.id }}">
                        {{ sliceString(item.description.id, 10) }}
                      </router-link>
                    </td>
                    <td data-title="备忘录 :">
                      {{ item.description.description }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script>
import {ArrowDownIcon, ArrowUpIcon, ChevronDownIcon} from '@heroicons/vue/outline'

export default {
  name: 'OverviewItem',
  props: ['setting'],
  data() {
    return {
      activeIndex: ''
    }
  },
  methods: {
    sliceString(string, symbols) {
      return string.length > symbols ? string.slice(0, symbols) + '...' : string
    },
    clickHandler(index) {
      this.activeIndex = index === this.activeIndex ? -1 : index
    },
    start() {
      this.desktopFlag = window.innerWidth > this.breakpoint
    },
    enter(el, done) {
      el.style.height = el.scrollHeight + 'px'
      done()
    },
    beforeEnter() {
    },
    beforeLeave(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    leave(el) {
      el.style.height = '0'
    },
    afterLeave(el) {
      el.style.height = 'auto'
    }
  },
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    ChevronDownIcon
  }
}
</script>

<style scoped>
</style>
