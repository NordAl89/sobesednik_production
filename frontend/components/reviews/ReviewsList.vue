<template>
  <section class="reviews-list">
    
    <!-- Форма для добавления отзыва -->
    <ReviewForm :expertId="expertId" />
    <!-- Загрузка -->
    <p v-if="loading" class="loading">
      Загрузка отзывов…
    </p>

    <!-- Нет отзывов -->
    <p v-else-if="reviews.length === 0" class="empty">
      Пока нет отзывов. Будьте первым!
    </p>

    <!-- Список отзывов -->
    <div v-else class="list">
      <article
        v-for="review in reviews"
        :key="review.id"
        class="review-card"
      >
        <!-- Заголовок -->
        <div class="header">
          <span class="author">{{ review.authorName }}</span>
          <span class="date">{{ formatDate(review.createdAt) }}</span>
        </div>

        <!-- Рейтинг -->
        <div v-if="review.rating" class="rating">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ active: star <= review.rating }"
          >
            ★
          </span>
        </div>

        <!-- Текст -->
        <p class="text">
          {{ review.text }}
        </p>

        <!-- Ответ эксперта -->
        <div v-if="review.expertReply" class="expert-reply">
          <strong>Ответ собеседника:</strong>
          <p>{{ review.expertReply }}</p>
        </div>
      </article>
    </div>
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
</style>
