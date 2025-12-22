<template>
    <div class="reset-page">
        <h1>Восстановление пароля</h1>
        
        <div v-if="!showConfirm" class="step1">
            <div class="info">
                <p><strong>Как восстановить пароль:</strong></p>
                <ol>
                    <li>
                        Откройте Telegram-бот:
                        <a href="https://t.me/sobesednik_helper_bot" target="_blank">@sobesednik_helper_bot</a>
                    </li>
                    <li>Нажмите кнопку <strong>Start</strong></li>
                    <li>Напишите и отправьте любое слово</li>
                    <li>Вернитесь на эту страницу и укажите:
                        <ul>
                            <li>ваш логин</li>
                            <li>ваше имя в Telegram</li>
                        </ul>
                    </li>
                    <li>Нажмите «Отправить код»</li>
                </ol>
                <p>После этого бот отправит вам код для смены пароля.</p>
            </div>
            
            <form @submit.prevent="handleReset" class="reset-form">
                <label>
                    Логин
                    <input v-model="form.login" type="text" required />
                </label>

                <label>
                    Telegram (например: @AlexFerrero9)
                    <input v-model="form.telegram" type="text" placeholder="@username" required />
                </label>

                <button type="submit" :disabled="loading">
                    {{ loading ? 'Отправка...' : 'Отправить код' }}
                </button>

                <div v-if="message" class="msg">{{ message }}</div>
                <div v-if="error" class="error">{{ error }}</div>
            </form>
        </div>

        <!-- Шаг 2: Ввод кода и нового пароля -->
        <div v-if="showConfirm" class="step2">
            <h2>Введите код и новый пароль</h2>
            
            <div class="info">
                <p>Мы отправили код в Telegram <strong>{{ form.telegram }}</strong></p>
                <p>Проверьте сообщения от <strong>@sobesednik_helper_bot</strong></p>
            </div>
            
            <form @submit.prevent="handleConfirm" class="confirm-form">
                <label>
                    6-значный код из Telegram
                    <input v-model="confirmForm.code" type="text" placeholder="code" maxlength="6" required />
                </label>
                
                <label class="password-field">
                    Новый пароль
                    <div class="password-input-wrapper">
                        <input 
                            v-model="confirmForm.password" 
                            :type="showNewPassword ? 'text' : 'password'" 
                            required 
                            class="password-input"
                        />
                        <button 
                            type="button" 
                            class="toggle-password"
                            @click="toggleNewPasswordVisibility"
                            tabindex="-1"
                        >
                            <span v-if="showNewPassword" class="icon">👁️</span>
                            <span v-else class="icon">👁️‍🗨️</span>
                        </button>
                    </div>
                </label>
                
                <label class="password-field">
                    Подтвердите пароль
                    <div class="password-input-wrapper">
                        <input 
                            v-model="confirmForm.confirmPassword" 
                            :type="showConfirmPassword ? 'text' : 'password'" 
                            required 
                            class="password-input"
                        />
                        <button 
                            type="button" 
                            class="toggle-password"
                            @click="toggleConfirmPasswordVisibility"
                            tabindex="-1"
                        >
                            <span v-if="showConfirmPassword" class="icon">👁️</span>
                            <span v-else class="icon">👁️‍🗨️</span>
                        </button>
                    </div>
                </label>
                
                <div class="form-actions">
                    <button type="button" @click="showConfirm = false" class="back-btn">
                        Назад
                    </button>
                    <button type="submit" :disabled="confirmLoading">
                        {{ confirmLoading ? 'Смена пароля...' : 'Сменить пароль' }}
                    </button>
                </div>
                
                <div v-if="confirmMessage" class="msg">{{ confirmMessage }}</div>
                <div v-if="confirmError" class="error">{{ confirmError }}</div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
    login: '',
    telegram: ''
})

const confirmForm = ref({
    code: '',
    password: '',
    confirmPassword: ''
})

const loading = ref(false)
const confirmLoading = ref(false)
const error = ref('')
const confirmError = ref('')
const message = ref('')
const confirmMessage = ref('')
const showConfirm = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const toggleNewPasswordVisibility = () => {
    showNewPassword.value = !showNewPassword.value
}

const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value
}

const handleReset = async () => {
    loading.value = true
    error.value = ''
    message.value = ''
    
    // Проверяем формат Telegram
    if (!form.value.telegram.startsWith('@')) {
        error.value = 'Укажите Telegram в формате @username'
        loading.value = false
        return
    }
    const config = useRuntimeConfig()
    try {
        const res = await $fetch(config.public.apiBase + `/experts/reset`, {
            method: 'POST',
            body: form.value
        })

        message.value = res.message || 'Код отправлен! Проверьте Telegram'
        showConfirm.value = true
        
    } catch (err) {
        error.value = err?.data?.message || err?.data?.error || 'Ошибка восстановления'
        if (error.value.includes('боту')) {
            error.value += ' Перейдите в бота и нажмите Start'
        }
    } finally {
        loading.value = false
    }
}

const handleConfirm = async () => {
    confirmLoading.value = true
    confirmError.value = ''
    confirmMessage.value = ''
    
    // Проверяем совпадение паролей
    if (confirmForm.value.password !== confirmForm.value.confirmPassword) {
        confirmError.value = 'Пароли не совпадают'
        confirmLoading.value = false
        return
    }
    
    // Проверяем длину пароля
    if (confirmForm.value.password.length < 6) {
        confirmError.value = 'Пароль должен быть не менее 6 символов'
        confirmLoading.value = false
        return
    }
        const config = useRuntimeConfig() 
    try {
        const res = await $fetch(config.public.apiBase + '/experts/reset/confirm', {
            method: 'POST',
            body: {
                login: form.value.login,
                code: confirmForm.value.code,
                password: confirmForm.value.password
            }
        })

        confirmMessage.value = 'Пароль успешно изменен! Теперь вы можете войти в личный кабинет.'
        
        // Через 2 секунды перенаправляем на страницу входа
        setTimeout(() => {
            navigateTo('/expert-login')
        }, 2000)
        
    } catch (err) {
        confirmError.value = err?.data?.message || err?.data?.error || 'Ошибка смены пароля'
    } finally {
        confirmLoading.value = false
    }
}
</script>

<style scoped>
.reset-page {
    max-width: 500px;
    margin: 40px auto;
    padding: 20px;
}

.info {
    background: #f0f7ff;
    border: 1px solid #c2d9ff;
    padding: 15px;
    border-radius: 10px;
    font-size: 0.95rem;
    margin-bottom: 20px;
}

.info strong {
    color: #2b7bff;
}

.info a {
    color: #2b7bff;
    font-weight: 600;
    text-decoration: none;
}

.info a:hover {
    text-decoration: underline;
}

.reset-form,
.confirm-form {
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
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
    width: 100%;
}

/* Стили для полей пароля */
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
    padding: 12px;
    background: #2b7bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.msg {
    color: green;
    text-align: center;
    padding: 10px;
    background: #f0fff0;
    border-radius: 6px;
}

.error {
    color: #d32f2f;
    text-align: center;
    padding: 10px;
    background: #ffebee;
    border-radius: 6px;
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.back-btn {
    background: #6c757d;
}

.back-btn:hover {
    background: #5a6268;
}

/* Адаптивность для мобильных */
@media (max-width: 480px) {
    .reset-page {
        padding: 15px;
        margin: 20px auto;
    }
    
    .password-input {
        padding-right: 36px;
    }
    
    .toggle-password {
        right: 6px;
        padding: 5px;
    }
    
    .form-actions {
        flex-direction: column;
    }
}
</style>