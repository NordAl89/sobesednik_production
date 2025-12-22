<template>
  <div
    class="expert-card-mini"
    :class="statusClass"
    @click="$emit('click', expert.id)"
  >
    <!-- Фото -->
    <NuxtImg
      :src="getImageUrl(expert.mainPhotoUrl) || getDefaultAvatar()"
      alt="Фото собеседника"
      class="main-photo"
      width="220"
      height="180"
      format="webp"
    />

    <!-- Информация -->
    <div class="expert-info">
<!-- <pre>{{ expert }}</pre>  -->
      <div class="name-rating">
         <h3>{{ expert.name }}</h3>
         
         <span v-if="expert.alwaysAvailable" class="always-available">24/7</span>       
         
      </div> 
      <p> <b>Рейтинг:</b> ⭐ {{ formatRating(expert.rating) }}</p>
      <p> <b>Возраст:</b> {{ expert.age }} {{ getAgeWord(expert.age) }}</p>
      <!-- <p>Пол: {{ expert.gender === 'male' ? 'Мужской' : 'Женский' }}</p> -->

      <p class="status-text">
        <b>Статус:</b> 
        <span :class="getStatusClass(expert.availability)">
          {{ getStatusText(expert.availability) }}
        </span>
      </p>

      <p class="price"><span class="price_simple"><b>Цена от:</b></span> {{ expert.price }} руб/час</p>

      <p v-if="expert.allowedTopics"><b>Разрешённые темы:</b> {{ expert.allowedTopics }}</p>
      <p v-if="expert.forbiddenTopics"><b>Запрещённые темы:</b> {{ expert.forbiddenTopics }}</p>
      
      <!-- Дополнительные индикаторы -->
      <div class="expert-tags">
        <span v-if="expert.adultTopics" class="tag tag-adult">18+</span>
        <span v-if="expert.noForbiddenTopics" class="tag tag-no-forbidden">Без запретов</span>
        <span v-if="expert.expertIsVerified" class="tag tag-is-verified">Подтверждён</span>
        
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  expert: {
    type: Object,
    required: true,
  },
})

const statusClass = computed(() => {
  if (props.expert.availability === 'Занят') return 'busy'
  if (props.expert.availability === 'Свободен') return 'free'
  return ''
})

const getStatusText = (availability) => {
  return availability === 'Занят' ? 'Занят' : 'Свободен'
}

// Класс для окраски текста статуса
const getStatusClass = (availability) => {
  if (availability === 'Занят') return 'status-busy'
  if (availability === 'Свободен') return 'status-free'
  return ''
}

const getAgeWord = (age) => {
  if (!age && age !== 0) return 'лет'
  const lastDigit = age % 10
  const lastTwoDigits = age % 100
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'лет'
  switch (lastDigit) {
    case 1: return 'год'
    case 2:
    case 3:
    case 4: return 'года'
    default: return 'лет'
  }
}

function getImageUrl(url) {
  if (!url) return null
  const config = useRuntimeConfig() 
  return url.startsWith('/uploads')
    ? `${config.public.fileBase}${url}`
    : `${config.public.fileBase}/uploads/${url}`
}

const getDefaultAvatar = () => '/images/expert-default.svg'

// Функция для форматирования рейтинга
const formatRating = (rating) => {
  if (!rating && rating !== 0) return '0';
  
  // Проверяем, является ли число целым
  if (Number.isInteger(rating)) {
    return rating.toString(); // Целое число - без запятой
  } else {
    return parseFloat(rating).toFixed(1); // Дробное - одна цифра после запятой
  }
}
// Функция для форматирования рейтинга. Конец
</script>

<style scoped>
.expert-card-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 12px;
  margin: 0; /* Убран margin, чтобы не выходить за границы */
  cursor: pointer;
  width: 100%; /* Изменено с 230px на 100% для гибкости */
  max-width: 100%;
  min-width: 0;
  background-color: #edeef0;
  transition: 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  box-sizing: border-box; /* Включаем padding и border в общую ширину */
}
.expert-card-mini:hover {
  transform: translateY(-3px);
}

.expert-card-mini.free {
  border-color: #99cdf0;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}
.expert-card-mini.busy {
  border-color: #e67e22;
  background-color: #fff6e6;
  opacity: 0.95;
}

.main-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 20px;
  margin-bottom: 10px;
}

.expert-info {
  width: 100%;
}

/* ——— Цвета статусов ——— */
.status {
  font-weight: 600;
}

.status-text {
  font-weight: normal;
  color: #555; /* обычный текст */
}

.status-busy {
  color: #e67e22; /* оранжевый для "Занят" */
  font-weight: 600;
}

.status-free {
  color: #3498db; /* голубой для "Свободен" */
  font-weight: 600;
}

.busy-label {
  margin-top: 8px;
  color: #e67e22;
  font-weight: bold;
}
.name-rating {
  display: flex;
  justify-content: space-between; /* раскидывает по краям */
  align-items: center;
}
h3 {
  margin: 0 0 6px 0;
  color: #2c3e50;
  font-size: 18px;
}

p {
  margin: 3px 0;
  color: #555;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  word-break: break-word;
}

.price {
  color: #27ae60;
  font-weight: bold;
  font-size: 16px;
  margin-top: 5px;
}
.price span {
  font-weight: normal;
  color: #555;
  font-size: 14px;
}
.always-available {
  background-color: #27ae60;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}
.expert-name {
  display: flex;
  align-items: center;
  gap: 6px;
  
}

.verified-badge {
  width: 24px;
  height: 24px;
  vertical-align: middle;
  margin-left: 6px;
}

/* Теги с характеристиками */
.expert-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.tag-adult {
  background-color: #e74c3c;
  color: white;
}

.tag-no-forbidden {
  background-color: #3498db;
  color: white;
}

.tag-is-verified {
  background-color: #ca9c02;
  color: white;
}

.rating-value{  
  font-size: 16px;
}
/* ---------- 📱 АДАПТИВНОСТЬ ---------- */

/* === Маленькие смартфоны (до 375px) === */
@media (max-width: 375px) {
  .expert-card-mini {
    flex-direction: row;
    width: 100%;
    max-width: 100%;
    align-items: flex-start;
    padding: 8px;
    margin: 0; /* Убираем margin, чтобы не выходить за границы */
  }

  .main-photo {
    width: 80px;
    height: 80px;
    min-width: 80px;
    margin-right: 10px;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .expert-info {
    flex: 1;
    min-width: 0; /* Позволяет text-overflow работать */
    overflow: hidden; /* Предотвращаем выход контента за границы */
  }

  h3 {
    font-size: 14px;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    font-size: 12px;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    margin: 2px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .price {
    font-size: 13px;
    margin-top: 3px;
  }

  .always-available {
    font-size: 10px;
    padding: 1px 4px;
  }

  .verified-badge {
    width: 18px;
    height: 18px;
    margin-left: 4px;
  }
}

/* === Обычные смартфоны (376px - 480px) === */
@media (min-width: 376px) and (max-width: 480px) {
  .expert-card-mini {
    flex-direction: row;
    width: 100%;
    max-width: 100%;
    align-items: flex-start;
    padding: 10px;
    margin: 0; /* Убираем margin */
  }

  .main-photo {
    width: 100px;
    height: 100px;
    min-width: 100px;
    margin-right: 12px;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .expert-info {
    flex: 1;
    min-width: 0;
    overflow: hidden; /* Предотвращаем выход контента за границы */
  }

  h3 {
    font-size: 15px;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    font-size: 13px;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .price {
    font-size: 14px;
  }

  .verified-badge {
    width: 20px;
    height: 20px;
  }
}

/* === Планшеты (481px - 768px) === */
@media (min-width: 481px) and (max-width: 768px) {
  .expert-card-mini {
    width: 100%;
    max-width: 100%;
    margin: 0; /* Grid gap в родителе контролирует отступы */
  }

  .main-photo {
    width: 100%;
    height: 160px;
  }

  h3 {
    font-size: 16px;
  }

  p {
    font-size: 13px;
    white-space: normal; /* Возвращаем перенос строк */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
  }
}

/* === Ноутбуки (769px - 1024px) === */
@media (min-width: 769px) and (max-width: 1024px) {
  .expert-card-mini {
    width: 100%;
    max-width: 100%;
    margin: 0;
  }

  .main-photo {
    width: 100%;
    height: 170px;
  }

  p {
    white-space: normal; /* Возвращаем перенос строк */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
  }
}

/* === Десктоп (1025px+) === */
@media (min-width: 1025px) {
  .expert-card-mini {
    width: 100%;
    max-width: 280px;
    margin: 0;
  }

  .main-photo {
    width: 100%;
    height: 180px;
  }

  p {
    white-space: normal; /* Возвращаем перенос строк */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
  }
}
</style>
