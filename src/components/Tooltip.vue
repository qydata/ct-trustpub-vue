<template>
  <div class="tooltip-box" :class="!clickToDisplay ? 'hover' : display ? 'display' : ''">
    <slot />
    <div class="tooltip" :class="[theme === 'dark' ? 'dark' : 'light', position || 'top', wide ? 'wide' : '']">
      <span class="text">{{ text }}</span>
    </div>
  </div>
</template>

<script>

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Tooltip',
  props: {
    clickToDisplay: {
      type: Boolean,
      required: false
    },
    display: {
      type: Boolean,
      required: false
    },
    position: {
      type: String,
      required: false
    },
    text: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      required: false
    },
    wide: {
      type: Boolean,
      required: false
    }
  }
}
</script>

<style scoped>
</style>
