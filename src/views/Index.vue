<template>
  <v-container
    class="bg-black bg-center bg-no-repeat bg-cover"
    :style="!hasWallet ? 'background-image: url(/assets/map.svg);' : ''"
  >
    <div class="flex items-center justify-center min-h-screen">
      <div class=" max-w-800">
        <div class="text-white md:px-6 mb-11 text-caption" v-if="!hasWallet">
          <v-card-item title="欢迎来到链上付" subtitle="从连接到一个钱包来开始">
            <template v-slot:prepend>
              <Logo/>
            </template>
          </v-card-item>
        </div>
      </div>
    </div>
    <ConnectModal
      :afterUnlock="gotoOverview"
      :close="resetAuto"
      :switchToForgetModal="openForgetModal"
      :visible="true" v-if="modal === 'unlock'"
    />
    <ForgetModal :afterForget="reset" :close="resetAuto" :visible="true" v-if="modal === 'forget'"/>
    <RestoreModal :afterRestore="gotoOverview" :close="reset" :visible="true" v-if="modal === 'restore'"/>
  </v-container>
</template>

<script>
import ForgetModal from '@/components/index/ForgetModal'
import RestoreModal from '@/components/index/RestoreModal'
import ConnectModal from '@/components/index/ConnectModal'
import Logo from '@/components/Logo'
import {mapState} from 'vuex'

export default {
  name: 'ViewIndex',
  title: '连接钱包',
  components: {
    ForgetModal,
    Logo,
    RestoreModal,
    ConnectModal
  },
  data: function () {
    return {
      modal: ''
    }
  },
  computed: mapState({
    address: 'address',
    locked: 'locked',
    hasWallet: state => state.address && state.address.length == 42
  }),
  methods: {
    gotoOverview() {
      if (this.modal != 'unlock') {
        sessionStorage.setItem('needAuth', 1)
      }

      this.$router.push('overview')
    },
    openForgetModal() {
      this.modal = 'forget'
    },
    reset() {
      this.modal = ''
    },
    resetAuto() {
      if (!this.hasWallet) this.modal = 'unlock'
      else this.modal = ''
    }
  },
  mounted() {
    if (!this.locked) this.$router.replace('overview')
    else this.resetAuto()
  }
}
</script>
