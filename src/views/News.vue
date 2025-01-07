<template>
  <v-container>
    <Header/>
    <v-row>
      <v-col cols="12" md="6">
        <v-card
          text="目录循环引用与自引用Weak与循环引用结构体中的自引用多线程并发并发和并行使用多线程线程同步：消息传递线程同步：锁、Condvar和信号量线程同步：Atomic原子操作与内存顺序基于Send和Sync的线程安全循环引用与自引用循环引用的概念循环引用指的是两">

          <template v-slot:title>
            Rust循环引用与多线程并发
          </template>
          <template v-slot:append>
            <v-img
              width="200"
              src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
            ></v-img>
          </template>

        </v-card>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="12" align="center">
        <small class="text-caption text-medium-emphasis">暂无更多</small>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>

import Header from '../components/Header.vue'

export default {
  name: 'News',
  data: function () {
    return {}
  },
  components: {
    Header
  },
  computed: {},
  mounted() {
  },
  methods: {},
  watch: {}
}
</script>

<style scoped>

</style>

<script setup lang="ts">
</script>
