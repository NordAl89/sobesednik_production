<template>
  <div class="blog-post"  ref="blogPostRef">
     <NuxtLink to="/blog" class="back-link">
      ← К списку статей
    </NuxtLink>    
    <div v-html="post.content"></div>
    <!-- CTA в конце статьи -->
    <div class="article-cta">
      <p>Познакомьтесь с нашими собеседниками — переходите по ссылке ниже.</p>
      <NuxtLink to="/" class="cta-button">
        Посмотреть собеседников
      </NuxtLink>
      
       
    </div>
<ScrollStopper ref="stopperRef" />
      <ScrollTopButton 
      :stopper-ref="stopperRef" 
      :parent-ref="blogPostRef" 
    />
    
  </div>
</template>

<script setup>
import { ref, } from 'vue'

const stopperRef = ref(null)
const blogPostRef = ref(null)

const route = useRoute()
const config = useRuntimeConfig()

const { data: post, error } = await useFetch(
  `${config.public.apiBase}/blog/${route.params.slug}`
)

if (error.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' })
}

// ✅ SEO
if (post.value) {
useSeoMeta({
  title: post.value.title,
  description: post.value.description,

  ogTitle: post.value.title,
  ogDescription: post.value.description,
  ogType: 'article',
  ogUrl: `https://sobesednik-na-chas.ru/blog/${route.params.slug}`,
  ogImage: post.value.image
    ? `${config.public.fileBase}${post.value.image}`
    : undefined,

  twitterCard: 'summary_large_image',
  twitterTitle: post.value.title,
  twitterDescription: post.value.description,
  twitterImage: post.value.image
    ? `${config.public.fileBase}${post.value.image}`
    : undefined,

    robots: 'index, follow',
})
}

useHead(() => ({
  script: post.value
    ? [
        // 📰 Article schema
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://sobesednik-na-chas.ru/blog/${route.params.slug}`,
            },
            headline: post.value.title,
            description: post.value.description,
            image: post.value.image
              ? [`${config.public.fileBase}${post.value.image}`]
              : undefined,
            datePublished: post.value.createdAt,
            dateModified: post.value.updatedAt || post.value.createdAt,
            author: {
              '@type': 'Organization',
              name: 'Собеседник на час',
              url: 'https://sobesednik-na-chas.ru',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Собеседник на час',
              logo: {
                '@type': 'ImageObject',
                url: 'https://sobesednik-na-chas.ru/images/logo.png',
              },
            },
          }),
        },

        // 🧭 Breadcrumbs schema
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Главная',
                item: 'https://sobesednik-na-chas.ru',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Блог',
                item: 'https://sobesednik-na-chas.ru/blog',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.value.title,
                item: `https://sobesednik-na-chas.ru/blog/${route.params.slug}`,
              },
            ],
          }),
        },
      ]
    : [],
}))

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}


</script>
<style scoped>
.blog-post {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 16px;
  background-color: rgba(243, 243, 240, 0.8);
}

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
  color: #000;
}

.blog-post h1 {
  font-size: 28px;
  margin-bottom: 24px;
}

.blog-post :deep(p) {
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 16px;
}

img {
  max-width: 800px;
  height: auto;
}

.article-cta {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.article-cta p {
  font-size: 16px;
  margin-bottom: 16px;
}

.cta-button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #6157eb;
  color: #fff;
  text-decoration: none;
  border-radius: 24px;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.cta-button:hover {
  background-color: #3f35c5;
}


</style>