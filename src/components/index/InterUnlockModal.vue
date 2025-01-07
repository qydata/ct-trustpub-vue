<template>
  <Modal :close="close" :visible="visible">
    <template v-slot:header>
      <h2>解锁钱包</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <form>
          <div class="form-group">
            <label>钱包地址</label>
            <span class="break-all">{{ address }}</span>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group"
               :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
            <label for="password">输入密码</label>
            <div class="relative input-wrap">

              <el-input
                size="large"
                  type="password"
                  @keypress="unlockOnEnter"
                  autocomplete="off"
                  placeholder="你的密码"

                  v-model="v$.password.$model"
                :prefix-icon="LockOpenIcon"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{ passwordError }}
            </div>
          </div>
        </form>
      </div>
    </template>

    <template v-slot:footer>
      <!-- eslint-disable-next-line max-len -->
      <!--      class="grid grid-cols-1 gap-32 p-32 rounded-md md:grid-cols-2 bg-black-100">-->
      <div
          class="grid grid-cols-1 gap-32 p-32 rounded-md md:grid-cols-2 bg-black-100">
        <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="unlock">解锁</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {LockOpenIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {mapState} from 'vuex'
import Modal from '../Modal'

export default {
  name: 'UnlockModal',
  components: {
    LockOpenIcon,
    Modal
  },
  data() {
    return {
      password: '',
      passwordError: ''
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  props: {
    afterUnlock: Function,
    close: Function,
    visible: Boolean
  },
  computed: {
    ...mapState({
      address: 'address',
      walletVersion: 'version'
    }),
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
        return false
      }
    },
    async unlock() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      this.$store.commit('setAddress', this.address)
      this.$store.commit('unlock')

      console.log('llllllllllllllll')

      this.afterUnlock()
    },
    unlockOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.unlock()
    }
  },
  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon
    }
  }
}
</script>
