<template>
  <label class="fake-radio cursor-pointer" :class="{ 'fake-radio--big' : big}" :for="id">
    <el-input
      size="large" type="radio" :name="name" class="fixed -left-full -top-full" :id="id" :checked="selected"
      :disabled="disabled"/>
    <span class="fake-input"><span v-if="extraName" class="font-semibold block">{{ extraName }}</span>{{ label }}</span>
  </label>
</template>

<script>
export default {
  name: 'RadioButton',
  props: ['name', 'label', 'id', 'extraName', 'big', 'selected', 'disabled']
}
</script>
<style scoped>
</style>
