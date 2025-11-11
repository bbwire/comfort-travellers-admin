export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})

