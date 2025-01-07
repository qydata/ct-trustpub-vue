<template>
  <Modal :close="close" :preventClickOutside="true" :showCloseButton="true" :visible="visible" :width="900">
    <template v-slot:header>
      <h2>交换<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
    </template>

    <template v-slot:body>
      <div class="grid grid-cols-1 gap-24 pt-12 pb-20 md:grid-cols-3">
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>质押</strong>
            <p class="mb-25">将 CT 转换为 XCT，用于质押、治理和服务使用。</p>
            <img src="/assets/deposit.svg" alt="质押从CT到XCT" class="account-panel__swap-img">
          </div>

          <button class="w-full button--outline-success button" @click="openDeposit">
            <span class="w-12 button__icon">
              <ArrowNarrowLeftIcon/>
            </span>
            质押
          </button>
        </div>
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>提现</strong>
            <p class="mb-25">将 XCT 转换为 CT，以便在草田链网络内使用。</p>
            <img src="/assets/withdraw.svg" alt="提现 从 XCT 到 CT" class="account-panel__swap-img">
          </div>
          <button class="w-full button--outline-success button" @click="openWithdraw">
            <span class="w-12 button__icon">
              <ArrowNarrowRightIcon/>
            </span>
            提现
          </button>
        </div>
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>出售</strong>
            <p class="mb-25">在草田链网络上以 CNY 的价格出售 CT。</p>
            <img src="/assets/sell.svg" alt="以人民币的价格出售 CT" class="account-panel__swap-img">
          </div>
          <button class="w-full button--outline-success button" @click="openSell">
            <span class="w-12 button__icon">
              <CurrencyDollarIcon/>
            </span>
            出售
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '../Modal'
import { ArrowNarrowLeftIcon, ArrowNarrowRightIcon, CurrencyDollarIcon } from '@heroicons/vue/outline'

export default {
  name: 'SwapModal',
  components: {
    ArrowNarrowLeftIcon,
    ArrowNarrowRightIcon,
    CurrencyDollarIcon,
    Modal
  },
  props: {
    close: Function,
    openDeposit: Function,
    openSell: Function,
    openWithdraw: Function,
    visible: Boolean
  }
}
</script>

<style scoped>
.account-panel__swap-img {
  height: 24px;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>
