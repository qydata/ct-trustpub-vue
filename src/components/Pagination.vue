<template>
  <nav class="pagination">
    <ol class="pagination__list">
      <li class="pagination__item">
        <router-link v-if="currentPage !== 1" :to="{ name: baseRoute, params: { page: 1 }}">First</router-link>
        <span class="not-link" v-else>First</span>
      </li>
      <li class="pagination__item">
        <router-link v-if="currentPage !== 1" :to="{ name: baseRoute, params: { page: currentPage - 1 }}">
          <ChevronLeftIcon/>
        </router-link>
        <span class="not-link" v-else><ChevronLeftIcon/></span>
      </li>
      <li class="pagination__item">
        <!-- eslint-disable-next-line max-len -->
        <span v-if="totalPages">Page {{Number(currentPage).toLocaleString()}} of {{Number(totalPages).toLocaleString()}}</span>
        <span v-else>&nbsp;</span>
      </li>
      <li class="pagination__item">
        <router-link v-if="currentPage < totalPages" :to="{ name: baseRoute, params: { page: currentPage + 1 }}">
          <ChevronRightIcon/>
        </router-link>
        <span class="not-link" v-else><ChevronRightIcon/></span>
      </li>
      <li class="pagination__item">
        <router-link v-if="currentPage < totalPages" :to="{ name: baseRoute, params: { page: totalPages }}">
          Last
        </router-link>
        <span class="not-link" v-else>Last</span>
      </li>
    </ol>
  </nav>
</template>

<script>
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/vue/solid'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Pagination',
  components: {ChevronRightIcon, ChevronLeftIcon},
  props: ['baseRoute', 'currentPage', 'totalPages']
}
</script>

<style scoped>
</style>
