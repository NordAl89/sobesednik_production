<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <NuxtLink to="/" @click="closeMenu">
          <NuxtImg
          src="/images/sobesednik_logo60.png" alt="Собеседник" class="logo-img"
          />
          <!-- <img src="/images/sobesed_logo.png" alt="Собеседник" class="logo-img" /> -->
        </NuxtLink>
      </div>

      <!-- Бургер для мобильной версии -->
      <button class="burger" @click="toggleMenu" aria-label="Меню">
        <span :class="{ open: isMenuOpen }"></span>
      </button>

      <!-- Навигация -->
      <nav :class="['nav', { open: isMenuOpen }]">
        <ul>
          <li><NuxtLink to="/" @click="closeMenu">Главная</NuxtLink></li>
          <li><NuxtLink to="/become-expert" @click="closeMenu">Стать собеседником</NuxtLink></li>
          <li><NuxtLink to="/about" @click="closeMenu">О нас</NuxtLink></li>
          <li><NuxtLink to="/blog" @click="closeMenu">Блог</NuxtLink></li>

          <li v-if="!store.isLoggedIn">
            <NuxtLink to="/expert-login" @click="closeMenu">Вход для экспертов</NuxtLink>
          </li>
          <li v-else>
            <NuxtLink :to="`/expert-profile/${store.currentExpert.id}`"
                      class="profile-link"
                      @click="closeMenu">
              Личный кабинет
            </NuxtLink>
          </li>          
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useExpertsStore } from '~/stores/expertsStore'

const store = useExpertsStore()
const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
function closeMenu() {
  isMenuOpen.value = false
}

// Блокировка скролла при открытом меню
onMounted(() => {
  watch(isMenuOpen, (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  })
})
</script>

<style scoped>
/* ---------- Общий стиль ---------- */
.header {
  background: linear-gradient(0deg, #fdf3d1 0%, #ffd79a 40%, #c6a4f5 100%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  max-width: 1600px;
  margin: 0 auto;
}

/* ---------- Логотип ---------- */
.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  height: 60px;
  width: 60px;
  border-radius: 50%;
  border: solid 2px #5d6adb;
  object-fit: cover;
  transition: transform 0.3s ease;
  
}
.logo-img:hover {
  transform: scale(1.1);
}

/* ---------- Навигация ---------- */
.nav ul {
  list-style: none;
  display: flex;
  gap: 20px;
  padding: 0;
  margin: 0;
}

.nav a {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}
.nav a:hover {
  color: #007bff;
  background-color: #f0f0f0;
}

.profile-link {
  background-color: #007bff;
  color: white !important;
}
.profile-link:hover {
  background-color: #0056b3;
}

/* ---------- Бургер ---------- */
.burger {
  display: none;
  width: 32px;
  height: 24px;
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
  z-index: 1100;
}

.burger span,
.burger span::before,
.burger span::after {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: #333;
  border-radius: 2px;
  transition: all 0.3s ease;
  content: "";
}

.burger span::before {
  top: -8px;
}
.burger span::after {
  top: 8px;
}

.burger span.open {
  background: transparent;
}
.burger span.open::before {
  transform: rotate(45deg) translate(5px, 5px);
}
.burger span.open::after {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* ---------- Адаптивность ---------- */

/* 📱 Мобильные устройства (до 480px) */
@media (max-width: 480px) {
  .burger {
    display: block;
  }

  .header-container {
    padding: 8px 15px;
  }

  .logo-img {
    height: 50px;
    width: 50px;
  }

  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 75%;
    height: 100vh;
    background: linear-gradient(0deg, #fdf3d1 0%, #ffd79a 40%, #c6a4f5 100%);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .nav.open {
    transform: translateX(0);
  }

  .nav ul {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .nav a {
    font-size: 1.1rem;
    padding: 8px 16px;
  }
}

/* 📱 Планшеты и средние экраны (481px - 768px) */
@media (min-width: 481px) and (max-width: 768px) {
  .burger {
    display: block;
  }

  .header-container {
    padding: 8px 20px;
  }

  .logo-img {
    height: 55px;
    width: 55px;
  }

  .nav {
    position: fixed;
    top: 0;
    right: 0;
    width: 60%;
    max-width: 350px;
    height: 100vh;
    background: linear-gradient(90deg, #fdf3d1 0%, #ffd79a 40%, #c6a4f5 100%);
    box-shadow: -2px 0 15px rgba(0, 0, 0, 0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .nav.open {
    transform: translateX(0);
  }

  .nav ul {
    flex-direction: column;
    gap: 25px;
    text-align: center;
  }

  .nav a {
    font-size: 1.15rem;
    padding: 10px 20px;
  }
}

/* 💻 Десктоп (769px и больше) */
@media (min-width: 769px) {
  .nav {
    transform: none !important;
    position: static;
    height: auto;
    width: auto;
    background: none;
    box-shadow: none;
  }

  .nav ul {
    flex-direction: row;
  }
}

/* 🖥️ Большие экраны (1200px+) */
@media (min-width: 1200px) {
  .header-container {
    padding: 8px 20px;
  }

  .nav ul {
    gap: 25px;
  }

  .nav a {
    font-size: 1rem;
    padding: 8px 14px;
  }
}
</style>
