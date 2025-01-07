<template>
    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible">
      <v-card title="接收资产">
        <v-card-item subtitle="我接收资金的公开地址">
        </v-card-item>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-row>
                <v-col cols="12" md="6" class="qrcode_parent">

                  <v-img
                    class="qrcode__image"
                    src="assets/logo.svg"
                    alt="ct logo"
                  />
                  <VueQrcode
                    :value="address"
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
            <v-list-item>
              <v-row>
                <v-col cols="6">
                  <v-btn rounded="xl" block size="x-large"
                         variant="tonal" @click="cancel">返回
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-tooltip v-model="displayTooltip"
                             location="top">
                    <template v-slot:activator="{ isActive,props }">
                      <div v-bind="props"></div>
                      <v-btn @click="copy" rounded="xl" block size="x-large">复制</v-btn>
                    </template>
                    <span>已复制到剪贴板</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
import {queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import {mapState} from 'vuex'
import Modal from '../Modal'
import Tooltip from '../Tooltip'

export default {
  name: 'ReceiveModal',
  data() {
    return {
      displayTooltip: false,

      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible
    }
  },
  components: {
    Modal,
    Tooltip,
    VueQrcode
  },
  props: {
    close: Function,
    visible: Boolean
  },
  computed: {
    ...mapState(['address'])
  },
  async mounted() {
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
  methods: {
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
.qrcode_parent{
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.qrcode__image {
  position: absolute;
  background-color: #1d1d1d;
  border: 0.25rem solid #1d1d1d;
  border-radius: 100%;
  width: 50px;
  height: 50px;
  padding: 3px;
}

</style>
