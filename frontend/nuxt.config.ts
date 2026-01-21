// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Определяем пути для алиасов, если нужно
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  // Дата совместимости Nuxt (важно для стабильности)
  compatibilityDate: "2025-07-15",

  // Включаем devtools для Vue
  devtools: { enabled: true },

  // Автоматическая генерация маршрутов из папки pages
  srcDir: "./",

  // Настройки runtimeConfig для локалной и публичной конфигурации. Разкомментировать после развёртки на сервере
  runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://sobesednik-na-chas.ru/api',
    fileBase: process.env.NUXT_PUBLIC_FILE_BASE_URL || 'https://sobesednik-na-chas.ru'
  }
},
  // Плагины
  plugins: [
    
  ],
  // Модули
  modules: [
    "@pinia/nuxt",
    "@nuxt/image",
    "@nuxtjs/sitemap",
    // ✅ ПРАВИЛЬНО: параметры модуля внутри массива
    [
      'yandex-metrika-module-nuxt3',
      {
        id: '105794207', // Ваш ID счетчика
        webvisor: true,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        ecommerce: "dataLayer"
        // consoleLog: true, // раскомментируйте для отладки
        // useCDN: false, // по умолчанию true
      }
    ]
  ],

  image: {
    inject: true,
    quality: 80,
    format: ["webp", "jpg"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  sitemap: {
  siteUrl: "https://sobesednik-na-chas.ru",
  gzip: true,

  exclude: [
    '/admin/**',
    '/admin-login',
    '/expert-login',
    '/expert-reset',
  ],

  async urls() {
    try {
      const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://sobesednik-na-chas.ru/api'
      
      // 👤 Эксперты
      const experts = await fetch(`${apiBase}/experts`).then(res => res.json())

      const expertUrls = experts.map((expert: any) => ({
        loc: `/experts/${expert.id}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: expert.updatedAt || expert.createdAt,
      }))

    // 📰 Блог
      const posts = await fetch(`${apiBase}/blog`).then(res => res.json())

      const blogUrls = posts.map((post: any) => ({
        loc: `/blog/${post.slug}`,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: post.updatedAt || post.createdAt,
      }))

      return [...expertUrls, ...blogUrls]
    } catch (error) {
      console.error('Ошибка генерации sitemap для экспертов:', error)
      return []
    }
  }
},
  // Стили по умолчанию
  css: ["~/assets/main.css"],

  // Алиасы
  alias: {
    "@": resolve(__dirname, "./"),
  },

  // Настройка сборщика (Vite)
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
  },

  // ✅ ДОБАВЛЯЕМ SEO КОНФИГУРАЦИЮ
  app: {
    head: {
      title:
        "Собеседник на час - Доверительное общение с понимающим собеседником",
      meta: [
        // Управляющие теги (оставить)
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "robots", content: "index, follow" },

        // Только базовый description (можно оставить)
        {
          name: "description",
          content: "Онлайн-платформа для доверительного общения...",
        },        
        // Open Graph - оставить только изображение, остальное убрать
        { property: "og:image", content: "/images/og-image.jpg" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "ru_RU" },        

        // Twitter - оставить только карточку и изображение
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "/images/twitter-image.jpg" },        
      ],
      link: [
        { rel: "canonical", href: "https://sobesednik-na-chas.ru" }, // Замените на ваш домен
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "alternate", type: "application/rss+xml", title: "RSS — Блог «Собеседник на час»", href: "https://sobesednik-na-chas.ru/rss.xml" },
      ],
      htmlAttrs: {
        lang: "ru",
      },
    },
  },
});

