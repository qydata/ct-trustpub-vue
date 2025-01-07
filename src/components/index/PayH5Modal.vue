<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card title="H5支付">
      <template v-slot:subtitle>
        订单号: {{ orderStorage.order_id }}
      </template>
      <v-card-text>
        <v-list>
          <v-list-item align="center">

            <v-progress-circular
              :size="70"
              :width="7"
              model-value="100"
              color="purple"
              :indeterminate="!isPay"
            ></v-progress-circular>

          </v-list-item>
          <v-list-item title="手续费接收地址:" :subtitle="address">
          </v-list-item>
          <v-divider></v-divider>
        </v-list>

        <v-list-item>
          <v-btn
            rounded="xl" block size="x-large"
            variant="tonal"
            @click="cancel"
            v-if="!isPay"
          >
            取消
          </v-btn>
          <v-btn v-else rounded="xl" block size="x-large" @click="cancel">支付成功</v-btn>
        </v-list-item>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {checkPay} from '@/utils/api'
import {mapState} from 'vuex'

export default {
  name: 'PayH5Modal',
  data() {
    return {
      displayTooltip: false,
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
      isMobile: false,
      isPay: false,
      orderStorage: this.order
    }
  },
  components: {},
  props: {
    close: Function,
    visible: Boolean,
    order: Object
  },
  async mounted() {
    // 检测是否为移动端
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

    if (this.orderStorage.order_id) {
      window.localStorage.setItem('order', JSON.stringify(this.orderStorage))
    }

    let orderStorage = window.localStorage.getItem('order')
    if (orderStorage) {
      this.orderStorage = JSON.parse(orderStorage)
    }

    window.setTimeout(() => {
      window.open(this.orderStorage.code_url)
    }, 1000)

    this.interId = window.setInterval(() => {
      this.checkPayStatus()
    }, 1000)
  },
  watch: {
    isPay(newValue) {
      if (newValue) {
        window.clearInterval(this.interId)
      }
    },
    visible(newValue) {
      // 当父组件的 prop 更新时，更新本地副本
      this.localVisible = newValue
    },
    localVisible(newValue) {
      // 当本地副本改变时，触发事件通知父组件更新
      this.$emit('update:visible', newValue)
    }
  },
  computed: {
    ...mapState(['address'])
  },
  methods: {
    checkPayStatus() {
      console.log(this.orderStorage.order_id)
      checkPay({order_id: this.orderStorage.order_id})
        .then((res) => {
          console.log(res)
          if (res.code !== 200) {
            // this.$message.error(res.msg)
          }
          else {
            console.log(res)
            this.$message.success('草田分到账可能存在延迟,请稍后查看账户.')
            this.isPay = true
            //把token放在浏览器上
            // this.$router.push("/home");
          }
        })
        .catch(() => {
          this.$message.error('网络请求失败')
        })
    },
    cancel() {
      this.displayTooltip = false
      window.clearInterval(this.interId)
      this.close()
    },
    copy() {
      navigator.clipboard.writeText(this.address)
      this.displayTooltip = true
      setTimeout(() => {
        this.displayTooltip = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.qrcode__image {
  position: absolute;
  background-color: #1d1d1d;
  border: 0.25rem solid #1d1d1d;
  border-radius: 100%;
  left: 17%;
  top: 38%;
  width: 50px;
  height: 50px;
  padding: 3px;
}

</style>
