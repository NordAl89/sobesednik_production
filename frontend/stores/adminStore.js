import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isAuthenticated: false,
    loginTime: null,
    loading: false,
  }),

  actions: {
    async login(loginData) {
      this.loading = true
      const config = useRuntimeConfig()
      try {
        const res = await $fetch(config.public.apiBase +`/admin/login`, {
          method: 'POST',
          body: loginData
        })

        if (res.success) {
          this.isAuthenticated = true
          this.loginTime = new Date().toISOString()

          if (process.client) {
            localStorage.setItem('adminAuthenticated', 'true')
            localStorage.setItem('adminLoginTime', this.loginTime)
          }
        }
      } catch (err) {
        this.isAuthenticated = false
        throw new Error(err?.data?.message || 'Ошибка авторизации')
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.isAuthenticated = false
      this.loginTime = null

      if (process.client) {
        localStorage.removeItem('adminAuthenticated')
        localStorage.removeItem('adminLoginTime')
      }
    },

    checkAuth() {
      if (process.server) return false

      const auth = localStorage.getItem('adminAuthenticated')
      const loginTime = localStorage.getItem('adminLoginTime')

      if (auth === 'true' && loginTime) {
        const loginDate = new Date(loginTime)
        const now = new Date()
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60)

        if (hoursDiff < 8) {
          this.isAuthenticated = true
          return true
        } else {
          this.logout()
        }
      }

      return false
    }
  }
})
