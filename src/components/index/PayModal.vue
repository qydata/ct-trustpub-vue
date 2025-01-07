<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card title="扫码支付">
      <template v-slot:subtitle>
        订单号: {{ order.order_id }}
      </template>
      <v-card-text>
        <v-list>
          <v-list-item>
            <v-row>
              <v-col cols="12" md="6">
                <VueQrcode
                  :value="order.code_url"
                  :options="{
                    margin: 1,
                    width: 200
                  }"
                />
              </v-col>

              <v-col cols="12" md="6">
                <span class="address">{{ address }}</span>
              </v-col>

            </v-row>
          </v-list-item>
          <v-divider></v-divider>
        </v-list>

        <v-list-item>
          <v-row>
            <v-col cols="6">
              <v-btn
                rounded="xl" block size="x-large"
                variant="tonal"
                @click="cancel"
              >
                取消
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn rounded="xl" block size="x-large" @click="checkPayStatus">已支付</v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {checkPay} from '@/utils/api'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import {mapState} from 'vuex'

export default {
  name: 'PayModal',
  data() {
    return {
      displayTooltip: false,
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
      isMobile: false
    }
  },
  components: {
    VueQrcode
  },
  props: {
    close: Function,
    visible: Boolean,
    order: Object
  },
  async mounted() {
    // 检测是否为移动端
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  },
  watch: {
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
      console.log(this.order.order_id)
      checkPay({order_id: this.order.order_id})
        .then((res) => {
          console.log(res)
          if (res.code !== 200) {
            this.$message.error(res.msg)
          }
          else {
            console.log(res)
            this.payCodeDialog = false
            // this.getBalance(this.ruleForm.toaddress);
            this.$message.success('草田分到账可能存在延迟,请稍后查看账户.')
            this.close()

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
