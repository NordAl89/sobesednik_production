<template>
  <div class="blog-page">
    <h1 class="blog-title">Блог сервиса «Собеседник на час»</h1>

    <div class="blog-list">
      <BlogCard v-for="post in posts" :key="post.id" :post="post" />
    </div>

    <button v-if="canLoadMore" class="load-more" :disabled="loading" @click="loadMore">
      {{ loading ? 'Загрузка…' : 'Далее' }}
    </button>
  </div>
</template>

<script setup>
import BlogCard from '@/components/BlogCard.vue'

const limit = 10
const offset = ref(0)
const posts = ref([])
const loading = ref(false)
const canLoadMore = ref(true)
const config = useRuntimeConfig()
const loadMore = async () => {
  if (loading.value || !canLoadMore.value) return

  loading.value = true
  try {
    const data = await $fetch(`${config.public.apiBase}/blog`, {
      params: {
        limit,
        offset: offset.value,
      },
    })

    if (data.length < limit) {
      canLoadMore.value = false
    }

    posts.value.push(...data)
    offset.value += limit
  } catch (e) {
    console.error('Ошибка загрузки статей', e)
    canLoadMore.value = false
  } finally {
    loading.value = false
  }
}

//Блок SEO для страницы блога
useHead(() => ({
  script: [
    // 📰 Blog schema
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Блог сервиса «Собеседник на час»',
        description:
          'Статьи о поддержке, доверительном общении и возможности выговориться. Онлайн-собеседники, которым можно доверять.',
        url: 'https://sobesednik-na-chas.ru/blog',
        publisher: {
          '@type': 'Organization',
          name: 'Собеседник на час',
          url: 'https://sobesednik-na-chas.ru',
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
        ],
      }),
    },
  ],
}))


// первая загрузка (SSR-friendly)
await loadMore()
</script>

<style scoped>
.blog-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 16px;
}

.blog-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
}

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.load-more {
  display: block;
  margin: 40px auto 0;
  margin: 40px auto 0;
  padding: 12px 32px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
}
</style>
