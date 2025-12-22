<template>
  <div id="app">
    <Header />
    <main class="content">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
</script>

<style>
/* Глобальный box-sizing для предотвращения проблем с шириной */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Общие стили для всей страницы */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Основной контент растягивается */
main.content {
  flex: 1;
  padding: 20px;
 background: linear-gradient(to bottom, #eedbe5 0%, #fceabb 70%, #f7e7c7 100%);
  background-attachment: fixed;
}

/* Header */
header {
  background-color: #f8f8f8;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Footer */
footer {
  background-color: #f8f8f8;
  padding: 10px 20px;
  text-align: center;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}
</style>