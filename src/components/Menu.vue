<template>
<!--  <v-tabs-->
<!--    align-tabs="center"-->
<!--    color="deep-purple-accent-4"-->
<!--  >-->
<!--    <v-tab v-for="(item, index) in mainNav" v-bind:key="index" :value="index">{{ item.text }}</v-tab>-->
<!--  </v-tabs>-->

    <ul class="hidden md:flex-1 main-nav">
      <li
        v-for="(item, index) in mainNav"
        :key="index"
        class="main-nav__item"
        :class="item.disabled ? 'disabled' : ''"
      >
        <el-link :underline="false"
                 v-if="item.external"
                 :href="item.link" target="_blank"
                 class="main-nav__link align-baseline">
          {{ item.text }}
          <el-icon color="#ffffff" size="18">
            <TopRight/>
          </el-icon>
        </el-link>
        <!-- eslint-disable max-len -->
        <el-link
          v-else
          :underline="false"
          @click="navigateToRoute(item.link)"
          class="main-nav__link"
          :class="location && item.link === location && ' router-link-active'"
        >
          {{ item.text }}
        </el-link>
        <!-- eslint-enable max-len -->
      </li>
    </ul>
</template>

<script>
import {
  TopRight
} from '@element-plus/icons-vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Menu',
  props: ['mainNav'],
  data: function () {
    return {
      location: null
    }
  },
  components: {
    TopRight
  },
  mounted() {
    this.location = window.location.pathname
  },
  watch: {
    location(newVal, oldVal) {
      // 当 iframeSrc 改变时，执行一些操作
      console.log(`location changed from ${oldVal} to ${newVal}`)
    }
  },
  methods: {
    navigateToRoute(routhPath) {
      // 替换为你的目标路径
      this.location = routhPath
      this.$router.push(routhPath)
    }
  }
}
</script>

<style scoped>
</style>
