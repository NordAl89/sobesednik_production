<template>
  <div ref="el" class="scroll-stopper"></div>
</template>

<script setup>
import { ref, defineExpose } from 'vue'

const el = ref(null)

defineExpose({
  el
})
</script>

<style scoped>
.scroll-stopper {
  width: 100%;
  height: 1px;
  visibility: hidden;
  pointer-events: none;
}
</style>