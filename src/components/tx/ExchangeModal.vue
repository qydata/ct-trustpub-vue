<template>
  <v-dialog
    persistent
    :close-on-back="false"
    width="99%"
    max-width="36rem"
    v-model="localVisible" :close="close"
    :showCloseButton="true">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h5 text-medium-emphasis ps-2">
          交易
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="close"
        ></v-btn>
      </v-card-title>
      <v-card-text>
        <v-row justify="center" align="center">
          <v-col cols="12">
            <v-card variant="tonal" title="充值">
              <template v-slot:subtitle>
                  <span class="text-wrap">
                    在草田链网络上以 CNY 的价格充值。
                  </span>
                <v-img :width="100" :height="60"
                       aspect-ratio="16/9" src="/assets/buy.svg" alt="提现 从 RMB 到 CT"/>
              </template>

              <template v-slot:append>
                <v-btn :prepend-icon="ArrowNarrowRightIcon"
                       size="large"
                       @click="()=>{
                         openBuy()
                       }">
                  充值
                </v-btn>

              </template>

            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card title="提现" variant="tonal">
              <template v-slot:subtitle>
                  <span class="text-wrap">
                    在草田链网络上以 CNY 的价格提现。
                  </span>
                <v-img :width="100" :height="60"
                       aspect-ratio="16/9" src="/assets/sell.svg" alt="以人民币的价格出售 CT"/>
              </template>

              <template v-slot:append>
                <v-btn :prepend-icon="CurrencyDollarIcon"
                       size="large"
                       @click="()=>{
                         openSell()
                       }">
                  提现
                </v-btn>
              </template>

            </v-card>
          </v-col>
        </v-row>
        <v-card-item/>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {ArrowNarrowLeftIcon, ArrowNarrowRightIcon, CurrencyDollarIcon} from '@heroicons/vue/outline'

export default {
  name: 'ExchangeModal',
  components: {},

  data() {
    return {
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
      chargeCTLoading: false
    }
  },
  props: {
    close: Function,
    openDeposit: Function,
    openSell: Function,
    openWithdraw: Function,
    openBuy: Function,
    openCharge: Function,
    visible: Boolean
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
  setup() {
    return {CurrencyDollarIcon, ArrowNarrowRightIcon, ArrowNarrowLeftIcon}
  }
}
</script>

<style scoped>
</style>
