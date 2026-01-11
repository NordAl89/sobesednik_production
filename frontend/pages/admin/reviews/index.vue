<template>
  <div class="admin-reviews">
    <h1>Модерация отзывов</h1>

    <div v-if="loading" class="loading">
      Загрузка отзывов…
    </div>

    <div v-else-if="reviews.length === 0" class="empty">
      🎉 Нет отзывов, ожидающих модерацию
    </div>

    <div v-else class="reviews-list">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-card"
      >
        <div class="review-meta">
          <span><strong>ID отзыва:</strong> {{ review.id }}</span>
          <span><strong>ID эксперта:</strong> {{ review.expertId }}</span>
          <span>
            <strong>Дата:</strong>
            {{ formatDate(review.createdAt) }}
          </span>
        </div>

        <div class="review-text">
          {{ review.text }}
        </div>

        <div v-if="review.rating !== null" class="review-rating">
          ⭐ Оценка: <strong>{{ review.rating }}</strong> / 5
        </div>

        <div class="review-actions">
          <button
            class="btn approve"
            @click="moderate(review.id, 'approved')"
          >
            ✅ Одобрить
          </button>

          <button
            class="btn reject"
            @click="confirmReject(review.id)"
          >
            ❌ Отклонить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const reviews = ref([])
const loading = ref(true)

// ❗ временно, пока нет авторизации
const adminLogin = 'admin'

const config = useRuntimeConfig()

/* ============================
   Загрузка pending отзывов
============================ */
const fetchPendingReviews = async () => {
  loading.value = true
  try {
    reviews.value = await $fetch(
      `${config.public.apiBase}/reviews/admin/pending`
    )
  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error)
    reviews.value = []
  } finally {
    loading.value = false
  }
}

/* ============================
   Модерация
============================ */
const moderate = async (reviewId, status) => {
  try {
    await $fetch(
      `${config.public.apiBase}/reviews/${reviewId}/moderate`,
      {
        method: 'POST',
        body: {
          status,
          moderatedBy: adminLogin
        }
      }
    )

    // Убираем отзыв из списка без перезагрузки
    reviews.value = reviews.value.filter(
      r => r.id !== reviewId
    )
  } catch (error) {
    console.error('Ошибка модерации:', error)
    alert('Ошибка при модерации отзыва')
  }
}

/* ============================
   Подтверждение отклонения
============================ */
const confirmReject = (reviewId) => {
  const ok = confirm(
    'Вы уверены?\nОтзыв будет отклонён и не повлияет на рейтинг.'
  )
  if (ok) {
    moderate(reviewId, 'rejected')
  }
}

/* ============================
   Утилиты
============================ */
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(fetchPendingReviews)
</script>

<style scoped>
.admin-reviews {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
}

h1 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.loading,
.empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.review-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 0.8rem;
}

.review-text {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 0.8rem;
  white-space: pre-line;
}

.review-rating {
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.review-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn.approve {
  background: #27ae60;
  color: white;
}

.btn.approve:hover {
  background: #219150;
}

.btn.reject {
  background: #e74c3c;
  color: white;
}

.btn.reject:hover {
  background: #c0392b;
}
</style>
