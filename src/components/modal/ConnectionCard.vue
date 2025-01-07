<template>
  <v-card :title=" connection.name"
          :subtitle="connection.id || ''"
          :text="connection.description || ''"
          variant="tonal">
    <v-card-actions>
      <v-btn type="primary" @click.prevent="disconnect">
        断开连接
      </v-btn>
    </v-card-actions>
    <template v-slot:prepend>
      <div class="grid grid-cols-12 gap-2">
        <div v-if="icon" class="col-span-4">
          <v-avatar
            rounded="0">
            <v-img
              :src="icon"
              class="img-fluid rounded-start"
              :alt="connection.name + '-icon'"
            />
          </v-avatar>
        </div>
      </div>
    </template>
  </v-card>
</template>

<script>
export default {
  name: 'Web3ConnectionCard',
  props: {
    connection: {
      type: Object,
      required: true
    },
    handleConnectionRequest: {
      type: Function,
      required: false
    },
    handleDisconnect: {
      type: Function,
      required: false
    },
    connector: {
      type: Object,
      required: false
    }
  },
  computed: {
    icon() {
      const connection = this.connection
      if (connection.icon) return this.connection.icon // Wallet Beacon Icons
      else if (connection.icons && connection.icons.length) return connection.icons[0] // Wallet Connect Icons

      return '' // Fallback case
    }
  },
  methods: {
    disconnect() {
      // killSession is used for Wallet Connect, if method does not exist use WB dispatch
      if (this.handleDisconnect) return this.handleDisconnect()
      else if (!this.connector.killSession) {
        return this.$store.dispatch('web3Connections/walletBeaconDisconnect')
      }
    }
  }
}
</script>
