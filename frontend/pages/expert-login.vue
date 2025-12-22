<template>
  <div class="login-page">
    <h1>Вход в личный кабинет</h1>
    <form @submit.prevent="handleLogin" class="login-form">
      <label>
        Логин
        <input v-model.trim="form.login" type="text" required />
      </label>
      
      <label class="password-field">
        Пароль
        <div class="password-input-wrapper">
          <input 
            v-model.trim="form.password" 
            :type="showPassword ? 'text' : 'password'" 
            required 
            class="password-input"
          />
          <button 
            type="button" 
            class="toggle-password"
            @click="togglePasswordVisibility"
            tabindex="-1"
          >
            <span v-if="showPassword" class="icon">👁️</span>
            <span v-else class="icon">👁️‍🗨️</span>
          </button>
        </div>
      </label>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>
      
      <div v-if="error" class="error">{{ error }}</div>
    </form>
    <p class="forgot" @click="navigateTo('/expert-reset')">
      Забыли пароль?
    </p>
  </div>
</template>

<script setup>
import { useExpertsStore } from '~/stores/expertsStore'
import { ref } from 'vue'

const form = ref({
  login: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  const config = useRuntimeConfig() 
  try {
    console.log('📤 Отправка данных для входа:', form.value)
    
    const response = await $fetch(config.public.apiBase + '/experts/login', {
      method: 'POST',
      body: form.value
    })
    
    console.log('✅ Успешный вход. Ответ сервера:', response)
    
    const expertsStore = useExpertsStore()
    expertsStore.setCurrentExpert(response)
    
    console.log('🔄 Переход в личный кабинет...')
    await navigateTo(`/expert-profile/${response.id}`)
    
  } catch (err) {
    console.error('❌ Ошибка входа:', err)
    console.log('🔍 Детали ошибки:', err.data)
    error.value = 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

/* Стили для поля пароля */
.password-field {
  position: relative;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 40px; /* Место для кнопки */
}

.toggle-password {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.1em;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #2b7bff;
}

.toggle-password:focus {
  outline: 2px solid #2b7bff;
  outline-offset: 2px;
  border-radius: 4px;
}

.icon {
  display: inline-block;
  user-select: none;
}

button[type="submit"] {
  padding: 10px;
  background: #2b7bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: red;
  text-align: center;
  font-size: 0.9em;
}

.forgot {
  text-align: center;
  margin-top: 10px;
  cursor: pointer;
  color: #2b7bff;
}

/* ==========================================================
   📱 АДАПТИВНОСТЬ
   ========================================================== */

@media (max-width: 375px) {
  .login-page {
    max-width: 100%;
    margin: 20px auto;
    padding: 15px;
  }

  h1 {
    font-size: 1.3rem;
  }

  .login-form {
    gap: 12px;
  }

  input {
    padding: 10px;
    font-size: 14px;
  }

  .password-input {
    padding-right: 38px;
  }

  .toggle-password {
    right: 6px;
    padding: 5px;
  }

  button[type="submit"] {
    padding: 12px;
    font-size: 15px;
  }
}

@media (min-width: 376px) and (max-width: 480px) {
  .login-page {
    padding: 18px;
    margin: 30px auto;
  }

  h1 {
    font-size: 1.5rem;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .login-page {
    max-width: 450px;
    padding: 25px;
  }
}

@media (min-width: 769px) {
  .login-page {
    max-width: 500px;
    padding: 30px;
  }
}
</style>