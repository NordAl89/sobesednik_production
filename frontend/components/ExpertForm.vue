<template>
  <form @submit.prevent="handleSubmit" class="expert-form">
    <h2>Регистрация</h2>

    <label>Логин</label>
    <input v-model="form.login" type="text" required />

    <label>Пароль</label>
    <input v-model="form.password" type="password" required />

    <label>Имя, Фамилия</label>
    <input v-model="form.name" type="text" required />

    <label>Возраст</label>
    <input v-model="form.age" type="number" min="18" required />

    <label>Занятость</label>
    <select v-model="form.status">
      <option value="Свободен">Свободен</option>
      <option value="Занят">Занят</option>
    </select>

    <label>Информация о себе</label>
    <textarea v-model="form.about"></textarea>

    <label>Разрешённые темы</label>
    <input v-model="form.allowedTopics" type="text" />

    <label>Запрещённые темы</label>
    <input v-model="form.forbiddenTopics" type="text" /> <!-- ИСПРАВЛЕНО -->

    <label>Стоимость часа общения</label>
    <input v-model="form.price" type="number" min="0" required />

    <button type="submit" :disabled="loading">{{ loading ? 'Создаём...' : 'Стать собеседником' }}</button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'

// API endpoint for expert creation
const EXPERT_API_URL = 'http://localhost:4000/experts'

const loading = ref(false)

const form = reactive({
  login: '',
  password: '',
  name: '',
  age: 18,
  status: 'Свободен',
  about: '',
  allowedTopics: '',
  forbiddenTopics: '', // ДОБАВЛЕНО
  price: ''
})

const handleSubmit = async () => {
  loading.value = true

  try {
    console.log('📤 Отправляемые данные:', form); // Логируем что отправляем

    const response = await fetch(EXPERT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form)
    })

    console.log('📥 Статус ответа:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка сервера:', errorText);
      throw new Error(`Ошибка ${response.status}: ${errorText}`);
    }

    const newExpert = await response.json();
    console.log('✅ Получен ответ:', newExpert);
    
    if (newExpert && newExpert.id) {
      // Правильное использование для Nuxt 3
      await navigateTo(`/experts/${newExpert.id}`);
    } else {
      alert('Ошибка: не удалось получить ID нового эксперта');
    }
  } catch (err) {
    console.error('💥 Ошибка:', err);
    alert('Ошибка при создании эксперта: ' + err.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.expert-form {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 2rem auto;
  gap: 10px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>