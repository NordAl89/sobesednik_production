<!-- pages/about.vue -->
<template>
  <div class="about-page">
    <!-- Герой-секция -->
    <section class="hero">
      <h1>О проекте "Собеседник на час"</h1>
      <p class="hero-subtitle">
        Пространство доверительного общения, где каждый может найти понимающего собеседника
      </p>
    </section>

    <!-- Основные разделы с аккордеоном -->
    <section class="content-sections">
      <AccordionItem title="🎯 Наша миссия и философия" :is-open="openSection === 'mission'"
        @toggle="toggleSection('mission')">
        <div class="accordion-content">
          <h3>Создаём пространство для искреннего общения</h3>
          <p>
            «Собеседник на час» — это больше чем просто платформа. Это сообщество людей,
            которые верят в силу живого человеческого общения. В мире, где цифровые технологии
            часто заменяют реальные контакты, мы создаём островки искренности и понимания.
          </p>
          <p> Над проектом работает команда специалистов в области коммуникаций, технологий и модерации.
              Мы отбираем собеседников и создаём комфортную среду для доверительного общения.
            </p>

          <h4>Наша философия:</h4>
          <ul>
            <li>💫 Каждый человек уникален и заслуживает быть услышанным</li>
            <li>🤝 Искренний диалог может изменить день, а иногда и жизнь</li>
            <li>🌈 В разнообразии мнений и опыта — наша сила</li>
            <li>🛡️ Доверие — основа любых значимых отношений</li>
          </ul>

          <!-- <div class="mission-stats">            
            <div class="stat">
              <span class="stat-number">{{ stats.users }}+</span>
              <span class="stat-label">пользователей</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ stats.conversations }}+</span>
              <span class="stat-label">состоявшихся бесед</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ stats.cities }}+</span>
              <span class="stat-label">городов России и СНГ</span>
            </div>
          </div> -->
        </div>
      </AccordionItem>

      <AccordionItem title="🔄 Как работает платформа" :is-open="openSection === 'how-it-works'"
        @toggle="toggleSection('how-it-works')">
        <div class="accordion-content">
          <div class="workflow">
            <div class="workflow-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Выбор собеседника</h4>
                <p>
                  Изучайте анкеты собеседников с фотографиями, описаниями, темами для разговора и отзывами.
                  У каждого эксперта есть свой уникальный стиль общения и специализация.
                </p>
              </div>
            </div>

            <div class="workflow-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Организация беседы</h4>
                <p>
                  Договаривайтесь о времени и формате общения. Доступны текстовый чат, голосовые звонки
                  и видеобеседы. Выбирайте то, что вам комфортно.
                </p>
              </div>
            </div>

            <div class="workflow-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Процесс общения</h4>
                <p>
                  Полностью приватная беседа один-на-один. Ваш собеседник внимательно выслушает,
                  поддержит и поделится своим видением ситуации.
                </p>
              </div>
            </div>

            <div class="workflow-step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Завершение и обратная связь</h4>
                <p>
                  После беседы вы можете оставить отзыв о собеседнике. Это помогает другим пользователям
                  сделать осознанный выбор.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AccordionItem>

      <!-- <AccordionItem title="❓ Часто задаваемые вопросы" :is-open="openSection === 'faq'" @toggle="toggleSection('faq')">
        <div class="accordion-content">
          <div class="faq-list">
            <div class="faq-item">
              <h4>Чем ваш сервис отличается от психологической помощи?</h4>
              <p>
                <strong>Наши собеседники</strong> — это эмпатичные люди с богатым жизненным опытом,
                которые умеют слушать и поддерживать. Они делятся дружескими советами и личным опытом,
                но <strong>не предоставляют профессиональную психологическую помощь</strong>, диагностику или терапию.
              </p>
            </div>

            <div class="faq-item">
              <h4>Конфиденциальны ли разговоры?</h4>
              <p>
                Да, абсолютно. Мы не записываем и не сохраняем содержание ваших бесед.
                Вся коммуникация происходит непосредственно между вами и собеседником.
              </p>
            </div>

            <div class="faq-item">
              <h4>Как выбираются собеседники?</h4>
              <p>
                Все собеседники проходят модерацию и проверку. Мы оцениваем их коммуникативные навыки,
                эмпатию и искреннее желание помогать людям. Некоторые также проходят дополнительную верификацию.
              </p>
            </div>
          </div>
        </div>
      </AccordionItem> -->

      <AccordionItem title="💎 Наши ценности и принципы" :is-open="openSection === 'values'"
        @toggle="toggleSection('values')">
        <div class="accordion-content">
          <div class="values-grid">
            <div class="value-item">
              <h4>🤝 Уважение и принятие</h4>
              <p>Мы ценим уникальность каждого человека и создаём пространство, свободное от осуждения и критики.</p>
            </div>
            <div class="value-item">
              <h4>🔒 Безопасность и конфиденциальность</h4>
              <p>Ваши границы и личное пространство неприкосновенны. Мы обеспечиваем полную приватность общения.</p>
            </div>
            <div class="value-item">
              <h4>💫 Искренность и эмпатия</h4>
              <p>Мы верим в силу настоящих, живых эмоций и глубокого человеческого понимания.</p>
            </div>
          </div>
        </div>
      </AccordionItem>
    </section>

    <!-- Призыв к действию -->
    <section class="cta-section">
      <h2>Присоединяйтесь к нашему сообществу</h2>
      <p>Начните свой путь к искреннему общению уже сегодня</p>
      <div class="cta-buttons">
        <NuxtLink to="/become-expert" class="btn btn-primary">Стать собеседником</NuxtLink>
        <NuxtLink to="/" class="btn btn-secondary">Найти собеседника</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
// Импортируем компонент
import AccordionItem from '~/components/AccordionItem.vue'

// Состояние для открытых секций
const openSection = ref('mission')

// Статистика
const stats = ref({
  users: '10,000',
  conversations: '50,000',
  cities: '200'
})

// Функция переключения секций
const toggleSection = (section) => {
  openSection.value = openSection.value === section ? null : section
}

// SEO оптимизация для страницы "О нас"
useSeoMeta({
  title: 'О проекте Собеседник на час - Миссия и ценности платформы доверительного общения',
  description: 'Узнайте о миссии проекта Собеседник на час - платформы для доверительного общения с понимающими собеседниками. Наши ценности, принципы работы и отличие от психологической помощи.',
  ogTitle: 'О проекте Собеседник на час - Пространство доверительного общения',
  ogDescription: 'Узнайте о нашей миссии создать безопасное пространство для открытого общения с понимающими собеседниками',
  ogImage: '/images/about-og.jpg'
})

useHead({
  meta: [
    { name: 'keywords', content: 'о проекте собеседник на час, миссия платформы общения, ценности доверительного общения, отличие от психолога, принципы работы' }
  ]
})
</script>

<style scoped>
.about-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.content-sections {
  margin: 3rem 0;
}

/* Стили для контента внутри аккордеона */
.accordion-content {
  padding: 1.5rem;
}

.accordion-content h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.accordion-content h4 {
  color: #34495e;
  margin: 1.5rem 0 0.5rem 0;
}

.accordion-content ul {
  list-style: none;
  padding-left: 0;
}

.accordion-content li {
  padding: 0.5rem 0;
  font-size: 1.1rem;
}

/* Статистика */
.mission-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* Воркфлоу */
.workflow-step {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.step-number {
  background: #667eea;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin-top: 0;
  color: #2c3e50;
}

/* FAQ */
.faq-item {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.faq-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.faq-item h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

/* Ценности */
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.value-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.value-item h4 {
  margin-top: 0;
}

/* CTA секция */
.cta-section {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  margin-top: 3rem;
}

.cta-section h2 {
  margin-bottom: 1rem;
  color: white;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: white;
  color: #f5576c;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-secondary:hover {
  background: white;
  color: #f5576c;
}

/* Адаптивность */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .workflow-step {
    flex-direction: column;
    text-align: center;
  }

  .step-number {
    align-self: center;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
  }

  .mission-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>