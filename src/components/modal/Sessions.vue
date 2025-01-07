<template>
  <div>
    <div v-for="(session, topic) in sessions" :key="topic" class="p-5">
      <connection-card
        v-if="session.version === 1"
        :connection="session.peerMeta"
        :handle-disconnect="
          () => {
            handleDisconnect(topic)
          }
        "
      />
      <connection-card
        v-else
        :connection="session.peer.metadata"
        :handle-disconnect="
          () => {
            handleDisconnect(topic)
          }
        "
      />
    </div>
  </div>
</template>

<script>
import ConnectionCard from './ConnectionCard.vue'
import {mapState} from 'vuex'

export default {
  name: 'WalletConnectSessions',
  components: {ConnectionCard},
  computed: {
    ...mapState({
    })
  },

  methods: {
    handleDisconnect(topic) {
      this.$store.dispatch('web3Connections/walletConnectSessionDisconnect', {
        topic
      })
    }
  }
}
</script>
