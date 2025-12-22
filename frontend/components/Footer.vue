<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- 🟡 Раздел Help -->
      <div class="footer-section">
        <h3>Поддержка</h3>
        <ul>
          <li><NuxtLink to="/faq">FAQ</NuxtLink></li>
          <li>
            <a href="https://t.me/sobesednik_support" target="_blank" rel="noopener">
              Поддержка в Telegram
            </a>
          </li>
        </ul>
      </div>

      <!-- 🟣 Раздел Company -->
      <!-- <div class="footer-section">
        <h3>Компания</h3>
        <ul>
          <li>
            <NuxtLink to="/admin-login">Админ-панель</NuxtLink>
          </li>
        </ul>
      </div> -->

      <!-- 🔵 Раздел Contacts -->
      <div class="footer-section">
        <h3>Контакты</h3>
        <ul>
          <li>
            <a href="mailto:podderzhkasobesednik@gmail.com">podderzhkasobesednik@gmail.com</a>
          </li>
          <li>
            <a href="https://t.me/Konstantin_Nor" target="_blank" rel="noopener">
              Telegram чат
            </a>
          </li>
          <!-- <li>
            <a href="https://vk.com/sobesednik" target="_blank" rel="noopener">VK</a>
          </li>
          <li>
            <a href="https://www.instagram.com/sobesednik" target="_blank" rel="noopener">
              Instagram
            </a>
          </li> -->
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 Собеседник на час. Все права защищены.</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: linear-gradient(0deg, #fdf3d1 0%, #ffd79a 40%, #c6a4f5 100%);
  padding: 30px 20px 15px;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
  color: #333;
  font-size: 15px;
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  text-align: left;
  max-width: 1200px;
  margin: 0 auto;
  gap: 30px;
}

.footer-section {
  flex: 1 1 200px;
}

.footer-section h3 {
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: #4b2e83;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 6px;
}

.footer-section a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #007bff;
}

.footer-bottom {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #555;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 10px;
}

/* ==========================================================
   📱 АДАПТИВНОСТЬ
   ========================================================== */

/* === Маленькие смартфоны (до 375px) === */
@media (max-width: 375px) {
  .footer {
    padding: 20px 12px 12px;
    font-size: 13px;
  }

  .footer-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .footer-section {
    flex: none;
    width: 100%;
  }

  .footer-section h3 {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .footer-section li {
    margin-bottom: 5px;
  }

  .footer-section a {
    font-size: 13px;
  }

  .footer-bottom {
    font-size: 0.8rem;
    margin-top: 15px;
    padding-top: 8px;
  }
}

/* === Обычные смартфоны (376px - 480px) === */
@media (min-width: 376px) and (max-width: 480px) {
  .footer {
    padding: 25px 15px 12px;
    font-size: 14px;
  }

  .footer-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 25px;
  }

  .footer-section {
    flex: none;
    width: 100%;
  }

  .footer-section h3 {
    font-size: 1.05rem;
  }
}

/* === Планшеты (481px - 768px) === */
@media (min-width: 481px) and (max-width: 768px) {
  .footer {
    padding: 28px 18px 14px;
  }

  .footer-container {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 25px;
    text-align: center;
  }

  .footer-section {
    flex: 1 1 45%; /* Две колонки на планшетах */
    min-width: 150px;
  }
}

/* === Ноутбуки и десктоп (769px+) === */
@media (min-width: 769px) {
  .footer {
    padding: 30px 20px 15px;
  }

  .footer-container {
    flex-direction: row;
    justify-content: space-around;
    text-align: left;
    gap: 30px;
  }

  .footer-section {
    flex: 1 1 200px;
  }
}

/* === Большие экраны (1200px+) === */
@media (min-width: 1200px) {
  .footer-container {
    max-width: 1400px;
    gap: 40px;
  }

  .footer-section {
    flex: 1 1 250px;
  }
}
</style>
