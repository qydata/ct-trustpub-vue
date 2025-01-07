<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">
    <v-card title="忘记钱包">
      <v-card-text>
        <v-list lines="three">
          <v-list-item
            title="这将从该浏览器中删除您的钱包。"
            subtitle="请确保您已备份您的私钥，否则您可能会丢失钱包中的所有资金。"
          />

          <v-list-item>
            <v-row>
              <v-col cols="6">
                <v-btn @click="cancel"
                       rounded="xl" block size="x-large"
                       variant="tonal">返回
                </v-btn>
                <!-- eslint-disable-next-line max-len -->

              </v-col>
              <v-col cols="6">
                <v-btn
                  rounded="xl" block size="x-large"
                  @click="forget">忘记钱包
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item>

        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ForgetWallet',
  components: {},
  props: {
    close: Function,
    afterForget: Function,
    visible: Boolean
  },
  data() {
    return {
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible
    }
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
      this.close()
    },
    async forget() {
      this.$store.dispatch('forget')
      this.afterForget()
    }
  }
}
</script>
