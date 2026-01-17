<template>
  <div v-if="!replying" class="reply-card">
    <!-- Показываем текст отзыва, на который эксперт может ответить -->
    <div v-if="review">
      <p class="review-text">{{ review.text }}</p>
    </div>
    <button @click="startReplying" class="reply-btn">Ответить</button>
  </div>

  <div v-else class="reply-card">
    <h4>Ответ на отзыв</h4>
    <textarea v-model="reply" placeholder="Ваш ответ" required></textarea>
    <button @click="submitReply" class="submit-btn">Отправить</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'

/**
 * Props (JS-версия)
 */
const props = defineProps({
  reviewId: {
    type: String,
    required: true
  }
})

const replying = ref(false)
const reply = ref('')
const review = ref(null)

const config = useRuntimeConfig()

// Функция для загрузки отзыва с сервера (если необходимо)
const fetchReview = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/reviews/${props.reviewId}`)
    review.value = response
  } catch (error) {
    console.error('❌ Ошибка при загрузке отзыва:', error)
  }
}

const startReplying = () => {
  replying.value = true
}

const submitReply = async () => {
  if (!reply.value.trim()) return

  try {
    await $fetch(`${config.public.apiBase}/reviews/${props.reviewId}/reply`, {
      method: 'POST',
      body: {
        expertReply: reply.value.trim()
      }
    })

    reply.value = ''
    replying.value = false

    console.log('✅ Ответ отправлен')
  } catch (error) {
    console.error('❌ Ошибка при отправке ответа:', error)
  }
}

// Загружаем отзыв при монтировании компонента
onMounted(fetchReview)
</script>

<style scoped>
.reply-card {
  background: #eef6ff;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.reply-btn {
  background: #3498db;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
}

.submit-btn {
  background: #3498db;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
</style>
