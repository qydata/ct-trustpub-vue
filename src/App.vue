<template>
  <v-app>
    <v-main class="overflow-scroll h-screen app-main  " style="scrollbar-width:none;">
      <router-view :key="$route.fullPath"/>
    </v-main>
    <!-- v-alert 用于显示警告消息 -->
    <div v-if="showAlert" style="z-index: 99999999999999999"
         class="fixed top-10 right-10 ">
      <v-alert :type="alertType" dismissible>
        {{ alertMessage }}
      </v-alert>
    </div>
  </v-app>
</template>

<script>
import {mapState} from 'vuex'
import {getWalletAddress} from './utils/storage'

// 在App.vue中
export default {
  components: {},
  title() {
    return '草田链'
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['address', 'showAlert', 'alertMessage', 'alertType'])
  },
  watch: {},
  async mounted() {
    // 检测是否为移动端
    const walletAddr = await getWalletAddress()
    if (walletAddr) {
      this.$store.commit('setAddress', walletAddr)
    }
  },
  // 返回清理函数
  methods: {}
}
</script>

<style>
</style>
