<template>
  <div v-if="visible" class="modal-backdrop" style="scrollbar-width:none;">
    <div class="modal-outer">
      <div class="inline-block w-full py-10 overflow-hidden align-bottom sm:py-30 sm:align-middle" :style="getStyle()">
        <div class="modal">
          <header class="modal-header">
            <slot name="header"></slot>
            <button v-if="showCloseButton" type="button" class="btn-close" @click="close">
              <XIcon/>
            </button>
          </header>

          <section class="modal-body">
            <slot name="body"></slot>
          </section>

          <footer class="modal-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {XIcon} from '@heroicons/vue/solid'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'ModalInter',
  props: {
    close: Function,
    showCloseButton: Boolean,
    visible: Boolean,
    width: Number
  },
  components: {
    XIcon
  },
  methods: {
    getStyle() {
      return {
        maxWidth: this.width ? `${this.width}px` : '36rem'
      }
    }
  }
}
</script>

<style scoped>
</style>
