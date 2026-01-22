<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="blog-card">
    <img
      v-if="post.image"
      :src="`${config.public.fileBase}${post.image}`"
      class="blog-card__image"
      alt=""
    />

    <div class="blog-card__content">
      <h2 class="blog-card__title">{{ post.title }}</h2>
      <p class="blog-card__excerpt">{{ post.excerpt }}</p>
    </div>
  </NuxtLink>
</template>

<script setup>
const config = useRuntimeConfig()

defineProps({
  post: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.blog-card {
  display: block;
  width: 100%;
  text-decoration: none;
  color: inherit;

  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;

  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.blog-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.blog-card__image {
  width: 100%;
  height: 100%; 
  object-fit: cover;
  display: block;
}

.blog-card__content {
  padding: 20px;
}

.blog-card__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.blog-card__excerpt {
  font-size: 16px;
  line-height: 1.5;
  color: #555;
}
</style>