export default defineNuxtRouteMiddleware(() => {
  // SSR: всегда отправляем на логин
  if (process.server) {
    return navigateTo('/admin-login')
  }

  // Client: реальная проверка
  const auth = localStorage.getItem('adminAuthenticated')
  const loginTime = localStorage.getItem('adminLoginTime')

  if (!auth || !loginTime) {
    return navigateTo('/admin-login')
  }

  const loginDate = new Date(loginTime)
  const now = new Date()
  const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)

  if (hoursDiff > 8) {
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminLoginTime')
    return navigateTo('/admin-login?expired=1')
  }
})
