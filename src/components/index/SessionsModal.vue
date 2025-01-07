<template>
  <v-dialog persistent
            :close-on-back="false"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card title="Session 管理">
      <v-card-text>
        <v-list lines="three">
          <v-list-item>
            <Sessions/>
          </v-list-item>
          <v-list-item>
            <v-btn rounded="xl" block size="x-large" @click="close">关闭
            </v-btn>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

  </v-dialog>
</template>

<script>
import {mapState} from 'vuex'
import Modal from '../Modal'
import Sessions from '../modal/Sessions.vue'

export default {
  name: 'AuthBindModal',
  components: {
    Sessions
  },
  props: {
    afterAuthBind: Function,
    close: Function,
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
  computed: {
    ...mapState(['address'])
  },
  methods: {},
  async mounted() {
  },
  setup() {
  }
}
</script>

<style scoped>
</style>
