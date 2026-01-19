<template>
  <div class="review-form-wrapper">
    <!-- Форма отзыва -->
    <form @submit.prevent="openRatingModal" class="review-form">
      <h3>Оставьте отзыв</h3>

      <div class="form-group">
        <!-- <label for="text">Текст отзыва</label> -->
        <textarea
          id="text"
          v-model="form.text"
          required
          placeholder="Поделитесь впечатлением"
        />
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Отправка...' : 'Отправить' }}
      </button>
    </form>

    <!-- Модальное окно рейтинга -->
    <div v-if="showRatingModal" class="modal-overlay">
      <div class="modal">
        <h4>Оцените собеседника</h4>

        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ active: star <= hoverRating || star <= form.rating }"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            @click="form.rating = star"
          >
            ★
          </span>
        </div>

        <p v-if="form.rating" class="rating-text">
          Ваша оценка: {{ form.rating }} ★
        </p>

        <div class="modal-actions">
          <button class="btn-confirm" @click="submitReview" :disabled="!form.rating || loading">
            {{ loading ? 'Отправка...' : 'Подтвердить' }}
          </button>
          <button class="btn-cancel" @click="closeModal" :disabled="loading">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useRouter } from 'vue-router'

const emit = defineEmits(['submitted'])
const router = useRouter()
/**
 * Props (JS-версия)
 */
const props = defineProps({
  expertId: {
    type: String,
    required: true
  }
})

const form = ref({
  text: '',
  rating: 0
})

const config = useRuntimeConfig()

const showRatingModal = ref(false)
const hoverRating = ref(0)
const loading = ref(false)

const openRatingModal = () => {
  if (!form.value.text.trim()) return
  showRatingModal.value = true
}

const closeModal = () => {
  showRatingModal.value = false
  form.value.rating = 0
}

const submitReview = async () => {
  if (!form.value.text.trim()) return

  loading.value = true

  try {
    await $fetch(`${config.public.apiBase}/reviews`, {
      method: 'POST',
      body: {
        expertId: props.expertId,
        text: form.value.text.trim(),
        rating: form.value.rating
      }
    })

    closeModal()
    // очистка формы
    form.value.text = ''
    form.value.rating = 0

    console.log('✅ Отзыв успешно отправлен на модерацию')

    emit('submitted')
    
    // Переход на публичную страницу эксперта
    await router.push(`/experts/${props.expertId}`)
    
  } catch (error) {
    console.error('❌ Ошибка при отправке отзыва:', error)
    
    // Тихая обработка ошибки IP - просто закрываем модальное окно без показа ошибки
    const errorMessage = error?.data?.message || error?.response?.data?.message || error?.message || ''
    
    if (errorMessage.includes('24 часа') || errorMessage.includes('оставляли отзыв')) {
      // Тихо закрываем модальное окно, не показывая ошибку пользователю
      closeModal()
      // Очищаем форму
      form.value.text = ''
      form.value.rating = 0
    } else {
      // Для других ошибок просто закрываем
      closeModal()
      form.value.text = ''
      form.value.rating = 0
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.submit-btn {
  background: #3498db;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-btn:hover {
  background: #2980b9;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 14px;
  width: 100%;
  max-width: 340px;
  text-align: center;
  border: solid 3px #3498db;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 2rem;
  margin: 1rem 0;
}

.star {
  cursor: pointer;
  color: #ddd;
}

.star.active {
  color: #f1c40f;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  
}

.cancel {
  background: transparent;
  color: #888;
}

.btn-confirm {
  background: #3498db;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-confirm:hover {
  background: #2980b9;
}
.btn-cancel {
  background: #ccc;
  color: rgb(32, 32, 32);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
} 
.btn-cancel:hover {
  background: #b3b3b3;
}
</style>
