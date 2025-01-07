<template>
  <div class="account-panel">
<!--    <VueHcaptcha :tabindex="tabindex" sitekey="a0bce798-5c05-4ab9-96ae-d15863e4e5fa" @verify="onVerify"></VueHcaptcha>-->
    <VueClicaptcha
      v-if="show" :callback="callback" :src="src"/>
  </div>
</template>

<script>
// import VueHcaptcha from '@hcaptcha/vue3-hcaptcha'
// import VueClicaptch from 'vue-clicaptcha'
import VueClicaptcha from 'vue-clicaptcha'
import {mapState} from 'vuex'

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
      // src: 'http://127.0.0.1:8000/clicaptcha.php',
      // src: 'https://manager.ctblock.cn/api/clicaptcha.php',
      src: 'http://127.0.0.1:8000/clicaptcha.php',
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
