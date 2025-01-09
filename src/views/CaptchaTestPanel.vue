<template>
  <div class="account-panel">
<!--    <VueHcaptcha :tabindex="tabindex" sitekey="a0bce798-5c05-4ab9-96ae-d15863e4e5fa" @verify="onVerify"></VueHcaptcha>-->
    <VueClicaptcha
      v-if="show" :callback="callback" :src="src"/>
  </div>
</template>

<script>
import VueClicaptcha from 'vue-clicaptcha'
import {mapState} from 'vuex'
const GlobalConfig = require('@/config/GlobalConfig.json')

export default {
  name: 'CaptchaTestPanel',
  props: ['view'],
  components: {
    // VueHcaptcha,
    VueClicaptcha

  },
  computed: mapState(['address', 'balance', 'cnyBalance']),
  data() {
    return {
      src: '',
      show: true,
      modal: '',
      tabindex: '0',
      walletName: '',
      canCopy: !!navigator.clipboard,
      item: {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      },
      order: {}
    }
  },
  watch: {},
  mounted() {
    const that = this
    this.src = GlobalConfig.CLICAPTCHA_URL
    window.setTimeout(() => {
      that.tabindex = '1'
    }, 5000)
  },
  methods: {
    callback() {
      alert('yes')
    },
    onVerify(response) {
      // 处理验证响应
      console.log('hCaptcha verification response:', response)
    }
  }
}

</script>

<style scoped>
</style>
