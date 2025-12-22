<!-- components/AccordionItem.vue -->
<template>
  <div class="accordion-item" :class="{ 'is-open': isOpen }">
    <button class="accordion-header" @click="$emit('toggle')">
      <span class="accordion-title">{{ title }}</span>
      <span class="accordion-icon">
        <span v-if="!isOpen">+</span>
        <span v-else>−</span>
      </span>
    </button>
    
    <transition name="accordion">
      <div v-show="isOpen" class="accordion-body">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])
</script>

<style scoped>
.accordion-item {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.accordion-item.is-open {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.accordion-header {
  width: 100%;
  padding: 1.5rem;
  background: white;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  transition: background-color 0.2s ease;
}

.accordion-header:hover {
  background: #f8f9fa;
}

.accordion-title {
  text-align: left;
}

.accordion-icon {
  font-size: 1.5rem;
  font-weight: 300;
  color: #667eea;
  transition: transform 0.3s ease;
}

.accordion-body {
  background: white;
  border-top: 1px solid #e9ecef;
  overflow: hidden;
}

/* Анимации */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 1000px;
  opacity: 1;
}

@media (max-width: 768px) {
  .accordion-header {
    padding: 1.2rem;
    font-size: 1rem;
  }
}
</style>