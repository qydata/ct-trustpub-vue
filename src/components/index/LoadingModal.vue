<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">
    <v-card>
      <template v-slot:text>
        <body>
        <div class="loading">
          <span style="--i: 0;"></span>
          <span style="--i: 2;"></span>
          <span style="--i: 4;"></span>
          <span style="--i: 6;"></span>
          <span style="--i: 8;"></span>
          <span style="--i: 10;"></span>
          <span style="--i: 12;"></span>
          <span style="--i: 14;"></span>
          <span style="--i: 16;"></span>
          <span style="--i: 18;"></span>
        </div>
        </body>
        <v-card-item align="center">
          <h3>加载中</h3>
        </v-card-item>
      </template>

      <v-card-item>
      </v-card-item>
    </v-card>

  </v-dialog>
</template>

<script>
import useVuelidate from '@vuelidate/core'
import Modal from '../Modal'

export default {
  name: 'LoadingModal',
  components: {
    Modal
  },
  props: {
    afterCreate: Function,
    close: Function,
    visible: Boolean
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
  data() {
    return {
      canCopy: !!navigator.clipboard,
      localVisible: this.visible
    }
  },
  validations() {
    return {}
  },
  computed: {
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    reset() {
      this.v$.$reset()
    }
  },
  async mounted() {

  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>

<style scoped>
.private-key {
  width: 32ch
}

.on-clicked-effect {
  transition: all 0.4s ease-in;
}

.on-clicked-effect:before {
  content: '';
  background-color: aliceblue;
  border-radius: 50%;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(0.001, 0.001);
}

.on-clicked-effect:focus:not(:active) {
  position: relative;
  display: inline-block;
  outline: 0;
}

.on-clicked-effect:focus:not(:active):before {
  animation: clicked_animation 0.8s ease-out;
}

@keyframes clicked_animation {
  50% {
    transform: scale(1.5, 1.5);
    opacity: 0;
  }
  99% {
    transform: scale(0.001, 0.001);
    opacity: 0;
  }
  100% {
    transform: scale(0.001, 0.001);
    opacity: 1;
  }
}

body {
  padding: 0;
  margin: 0;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading {
  width: 50px;
  height: 50px;
  position: relative;
}

.loading > span {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(calc(var(--i) * 18deg));
}

.loading > span::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #fff;
  animation: breath 2s linear infinite;
  animation-delay: calc(var(--i) * 0.1s);
}

@keyframes breath {
  0% {
    transform: scale(0);
  }
  10% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(0);
  }
}

</style>
