<template>
  <div class="admin-login">
    <div class="login-container">
      <h1>Вход в панель администратора</h1>
      
      <!-- Сообщение об истекшей сессии -->
      <div v-if="isSessionExpired" class="session-expired">
        ⚠️ Ваша сессия истекла. Пожалуйста, войдите снова.
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Логин</label>
          <input 
            v-model="form.login" 
            type="text" 
            required 
            placeholder="Enter admin login"
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label>Пароль</label>
          <input 
            v-model="form.password" 
            type="password" 
            required 
            placeholder="введите пароль"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from '~/stores/adminStore'

const adminStore = useAdminStore()
const router = useRouter()

const form = ref({
  login: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const isSessionExpired = ref(false)

// Проверяем, не истекла ли сессия (для показа сообщения)
onMounted(() => {
  // Если уже авторизован - редирект в админку
  if (adminStore.checkAuth()) {
    navigateTo('/admin')
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await adminStore.login(form.value)
    // Перенаправляем в админ-панель
    await navigateTo('/admin')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 1.8rem;
}

.session-expired {
  background: #fff3cd;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #ffeaa7;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.login-btn {
  padding: 14px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #2980b9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #ffe6e6;
  color: #c0392b;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #ffcccc;
}

/* ==========================================================
   📱 АДАПТИВНОСТЬ
   ========================================================== */

@media (max-width: 375px) {
  .admin-login {
    padding: 10px;
  }

  .login-container {
    padding: 20px;
  }

  h1 {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }

  .form-group input {
    padding: 10px;
    font-size: 14px;
  }

  .login-btn {
    padding: 12px;
    font-size: 15px;
  }
}

@media (min-width: 376px) and (max-width: 480px) {
  .login-container {
    padding: 30px;
  }

  h1 {
    font-size: 1.5rem;
  }
}

@media (min-width: 481px) {
  .login-container {
    padding: 40px;
  }
}
</style>