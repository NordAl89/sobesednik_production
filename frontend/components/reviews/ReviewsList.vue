<template>
  <section class="reviews-list">

    <!-- Форма для добавления отзыва -->
    <ReviewForm :expertId="expertId" />
    <!-- Кнопка для показа/скрытия отзывов -->
    <button v-if="reviews.length > 0" @click="toggleVisibility" class="toggle-btn">
      {{ visible ? 'Скрыть отзывы' : 'Показать отзывы' }}
    </button>
    <!-- Загрузка -->
    <p v-if="loading" class="loading">
      Загрузка отзывов…
    </p>

    <!-- Нет отзывов -->
    <p v-else-if="reviews.length === 0" class="empty">
      Пока нет отзывов. Будьте первым!
    </p>

    <transition name="slide-fade" @enter="enter" @leave="leave">
      <div v-if="visible" class="list">
        <article v-for="review in reviews" :key="review.id" class="review-card">
          <!-- Заголовок -->
          <div class="header">
            <span class="author">{{ review.authorName }}</span>
            <span class="date">{{ formatDate(review.createdAt) }}</span>
          </div>

          <!-- Рейтинг -->
          <div v-if="review.rating" class="rating">
            <span v-for="star in 5" :key="star" class="star" :class="{ active: star <= review.rating }">
              ★
            </span>
          </div>

          <!-- Текст -->
          <p class="text">
            {{ review.text }}
          </p>

          <!-- Ответ эксперта -->
          <div v-if="review.expertReply" class="expert-reply">
            <strong>{{ review.expertName || 'собеседника' }}</strong>
            <p>{{ review.expertReply }}</p>
          </div>
        </article>
      </div>
    </transition>

  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import ReviewForm from '~/components/reviews/ReviewForm.vue';
/**
 * Props (JS-версия, без TypeScript)
 */
const props = defineProps({
  expertId: {
    type: String,
    required: true
  }
})

const reviews = ref([])
const loading = ref(false)
const visible = ref(false) // состояние видимости списка отзывов

const config = useRuntimeConfig()

const fetchReviews = async () => {
  if (!props.expertId) return

  loading.value = true
  try {
    reviews.value = await $fetch(
      `${config.public.apiBase}/reviews/expert/${props.expertId}`
    )
  } catch (error) {
    console.error('❌ Ошибка загрузки отзывов:', error)
    reviews.value = []
  } finally {
    loading.value = false
  }
}
// Функция для показа/скрытия отзывов
const toggleVisibility = () => {
  visible.value = !visible.value
}
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(fetchReviews)

watch(
  () => props.expertId,
  fetchReviews
)
// Анимация показа/скрытия озывов
const enter = (el) => {
  el.style.height = '0'
  el.style.opacity = '0'
  el.style.overflow = 'hidden'
  const height = el.scrollHeight
  requestAnimationFrame(() => {
    el.style.transition = 'height 1s ease, opacity 1s ease'
    el.style.height = height + 'px'
    el.style.opacity = '1'
  })
  el.addEventListener('transitionend', function handler() {
    el.style.height = 'auto'
    el.style.transition = ''
    el.style.overflow = ''
    el.removeEventListener('transitionend', handler)
  })
}

const leave = (el) => {
  el.style.height = el.scrollHeight + 'px'
  el.style.opacity = '1'
  el.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    el.style.transition = 'height 1s ease, opacity 1s ease'
    el.style.height = '0'
    el.style.opacity = '0'
  })
}

</script>

<style scoped>
.reviews-list {
  margin-top: 2rem;
  padding: 0.5rem;
  background: #f9f9f9;
  border-radius: 12px;
}

.title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #2c3e50;
}

.loading,
.empty {
  text-align: center;
  color: #777;
  font-style: italic;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.author {
  font-weight: 600;
  color: #34495e;
}

.date {
  font-size: 0.85rem;
  color: #999;
}

.rating {
  margin-bottom: 0.5rem;
}

.star {
  font-size: 1.2rem;
  color: #ddd;
}

.star.active {
  color: #f1c40f;
}

.text {
  line-height: 1.6;
  color: #333;
}

.expert-reply {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #eef6ff;
  border-left: 4px solid #3498db;
  border-radius: 6px;
}

.expert-reply p {
  margin: 0.25rem 0 0;
}

.toggle-btn {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #2980b9;
}

</style>
