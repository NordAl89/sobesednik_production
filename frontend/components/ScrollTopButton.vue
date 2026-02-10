<template>
  <button
    ref="btnUp"
    :class="[
      'btn-up',
      isAbsolute ? 'btn-up_absolute' : 'btn-up_fixed',
      'btn-up_hide'
    ]"
    aria-label="Наверх"
  ></button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  stopperRef: {
    type: Object,
    default: null
  },
  parentRef: {
    type: Object,
    default: null
  }
})

const btnUp = ref(null)
const isAbsolute = ref(false)
let scrolling = false

const show = () => {
  const el = btnUp.value
  if (
    el.classList.contains('btn-up_hide') &&
    !el.classList.contains('btn-up_hiding')
  ) {
    el.classList.remove('btn-up_hide')
    el.classList.add('btn-up_hiding')
    setTimeout(() => {
      el.classList.remove('btn-up_hiding')
    }, 300)
  }
}

const hide = () => {
  const el = btnUp.value
  if (
    !el.classList.contains('btn-up_hide') &&
    !el.classList.contains('btn-up_hiding')
  ) {
    el.classList.add('btn-up_hiding')
    setTimeout(() => {
      el.classList.add('btn-up_hide')
      el.classList.remove('btn-up_hiding')
    }, 300)
  }
}

const updatePosition = () => {
  // Если нет стоппера или кнопки, выходим
  if (!props.stopperRef?.value || !btnUp.value) return
  
  // Получаем DOM-элемент стоппера
  const stopperElement = props.stopperRef.value.$el || props.stopperRef.value
  if (!stopperElement) return
  
  const stopperRect = stopperElement.getBoundingClientRect()
  const btnHeight = btnUp.value.offsetHeight || 50
  const offset = 20
  
  // Высота окна просмотра
  const viewportHeight = window.innerHeight
  
  // Позиция стоппера относительно окна просмотра
  const stopperTop = stopperRect.top
  
  // Логика простая:
  // Если стоппер находится выше нижней границы окна (с учетом высоты кнопки),
  // переключаемся в absolute режим
  isAbsolute.value = stopperTop < viewportHeight - btnHeight - offset
  
  console.log('Stopper position:', stopperTop, 'Viewport:', viewportHeight, 'Absolute:', isAbsolute.value)
  
  // Если в absolute режиме, позиционируем кнопку над стоппером
  if (isAbsolute.value && btnUp.value.parentElement) {
    const parentRect = btnUp.value.parentElement.getBoundingClientRect()
    const parentBottom = parentRect.bottom + window.scrollY
    
    // Вычисляем позицию для absolute: на offset выше стоппера
    const stopperBottom = stopperRect.bottom + window.scrollY
    const absoluteBottom = parentBottom - stopperBottom + offset
    
    btnUp.value.style.bottom = `${Math.max(offset, absoluteBottom)}px`
    btnUp.value.style.right = '20px'
  } else {
    // В fixed режиме сбрасываем стили
    btnUp.value.style.bottom = ''
    btnUp.value.style.right = ''
  }
}

const onScroll = () => {
  const scrollY = window.scrollY || document.documentElement.scrollTop

  if (scrolling && scrollY > 0) return
  scrolling = false

  if (scrollY > 400) {
    show()
  } else {
    hide()
  }

  updatePosition()
}

const scrollToTop = () => {
  scrolling = true
  hide()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', updatePosition)
  btnUp.value.addEventListener('click', scrollToTop)
  
  // Инициализация с небольшой задержкой
  setTimeout(updatePosition, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updatePosition)
  if (btnUp.value) {
    btnUp.value.removeEventListener('click', scrollToTop)
  }
})

// Следим за изменениями рефов
watch(() => [props.stopperRef, props.parentRef], updatePosition, { 
  immediate: true,
  deep: true 
})
</script>

<style scoped>
.btn-up {
  width: 60px;
  height: 50px;
  background-color: #673ab7;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease;
  opacity: 1;
  border: none;
  z-index: 1000;
  transform: translateY(0);
}

.btn-up_fixed {
  position: fixed;
  bottom: 0;
  right: 20px;
}

.btn-up_absolute {
  position: absolute;
  bottom: 0;
  right: 20px;
}

.btn-up::before {
  content: "";
  width: 40px;
  height: 40px;
  background: transparent no-repeat center center;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23fff' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z'/%3E%3C/svg%3E");
}

.btn-up_hide {
  display: none;
  transform: translateY(20px);
}

.btn-up_hiding {
  opacity: 0;
  transform: translateY(20px);
}

@media (hover: hover) and (pointer: fine) {
  .btn-up:hover {
    background-color: #512da8;
  }
}

/* Для отладки */
.btn-up_absolute {
  background-color: #ff5722 !important;
}
</style>