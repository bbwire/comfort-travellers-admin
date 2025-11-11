export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (process.server) {
    return
  }

  const authStore = useAuthStore()
  const router = useRouter()

  // Wait for auth to initialize (but don't block indefinitely)
  if (authStore.loading) {
    // Allow the page to render while loading
    return
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(to.path)

  // If not authenticated and trying to access protected route
  if (!authStore.isAuthenticated && !isPublicRoute) {
    return navigateTo('/login')
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }

  // Check role-based access for admin routes
  if (authStore.isAuthenticated && !isPublicRoute) {
    const requiresAdmin = to.meta.requiresAdmin === true
    const requiresAgent = to.meta.requiresAgent === true

    if (requiresAdmin && !authStore.isAdmin) {
      return navigateTo('/403')
    }

    if (requiresAgent && !authStore.canAccessAdmin) {
      return navigateTo('/403')
    }
  }
})

