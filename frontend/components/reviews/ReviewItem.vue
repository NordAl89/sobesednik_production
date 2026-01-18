<template>
  <article class="review-card">
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

    <!-- Текст отзыва -->
    <p class="text">
      {{ review.text }}
    </p>

    <!-- Ответ эксперта -->
    <div v-if="review.expertReply" class="expert-reply">
      <strong>{{ review.expertName || 'собеседника' }}</strong>
      <p>{{ review.expertReply }}</p>
    </div>
  </article>
</template>

<script setup>
/**
 * Props (JS-версия, без TypeScript)
 */
const props = defineProps({
  review: {
    type: Object,
    required: true,
    validator(value) {
      return (
        typeof value.id === 'string' &&
        typeof value.authorName === 'string' &&
        typeof value.createdAt === 'string' &&
        typeof value.rating === 'number' &&
        typeof value.text === 'string'
      )
    }
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>


<style scoped>
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
