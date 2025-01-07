<template>
  <div>
    <div @click.prevent="showList">
      <div class="selectList">
        <span class="item">
          {{ selectOne().labelName }}
        </span>
        <span class="pointer-events-none header-tools__icon--expand">
        <ChevronDownIcon/>
        </span>
      </div>
    </div>
    <ul class="header-tools" :class="showTools ? 'showTools' : 'hideTools'">
      <li class="header-tools__item" v-for="(item, index) in contractList" :key="index">
        <div class="header-tools__link" @click="itemClick(item)">
          <span class="header-tools__icon">
            <Tickets :class="{'green':defaultV == item.contractName}"/>
          </span>
          {{ item.labelName }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {ChevronDownIcon, CogIcon, KeyIcon, LockOpenIcon, LogoutIcon, PlusIcon, UserIcon} from '@heroicons/vue/outline'
import vClickOutside from 'click-outside-vue3'
import {Tickets} from '@element-plus/icons-vue'

const ABI_const = require('@/contract/ABI_const.js')

export default {
  name: 'HeaderTools',
  components: {
    ChevronDownIcon,
    Tickets
  },
  data: function () {
    return {
      showTools: false,
      defaultV: 'ERC721Ctnft',
      contractList: [
        {
          contract: ABI_const['ERC721Ctnft'],
          labelName: '721协议合约',
          contractName: ABI_const['ERC721Ctnft'].contractName
        },
        {
          contract: ABI_const['ERC1155Ctnft'],
          labelName: '1155协议合约',
          contractName: ABI_const['ERC1155Ctnft'].contractName
        },
        {
          contract: ABI_const['ERC1155CtnftOwner'],
          labelName: '1155协议合约(只有创建者可以铸造)',
          contractName: ABI_const['ERC1155CtnftOwner'].contractName
        }
      ],
      contractAddress: '',
      loading: false
    }
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  methods: {
    itemClick(item) {
      this.showTools = false
      this.defaultV = item.contractName
    },
    showList() {
      console.log('showList', this.showTools)
      this.showTools = !this.showTools
    },
    selectOne() {
      const ObList = this.contractList
      for (const obListElement of ObList) {
        if (obListElement.contractName == this.defaultV) {
          this.updateData(obListElement.contractName)
          return obListElement
        }
      }
      this.updateData(ABI_const['ERC721Ctnft'].contractName)
      return {
        contract: ABI_const['ERC721Ctnft'],
        labelName: '721协议合约',
        contractName: ABI_const['ERC721Ctnft'].contractName
      }
    }
  },
  props: {
    openForgetWalletModal: Function,
    openExportKeyModal: Function,
    openCreateModal: Function,
    openAuthBindModal: Function,
    updateData: Function
  }
}
</script>

<style scoped>
</style>
