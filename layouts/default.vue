<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 h-full">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Comfort Travellers</h2>
          <p class="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav class="mt-4 px-2 space-y-1">
          <button
            v-for="item in menuOptions"
            :key="item.path"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition"
            :class="
              activeMenuKey === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            "
            @click="handleMenuSelect(item.path)"
          >
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 ml-64 bg-gray-50 min-h-screen">
        <!-- Topbar -->
        <header class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ pageTitle }}
              </h1>
            </div>
            <div class="relative">
              <button
                type="button"
                class="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-100 transition"
                @click.stop="toggleUserMenu"
              >
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {{ userInitial }}
                  </div>
                  <div class="hidden md:flex flex-col items-start">
                    <span class="text-sm font-medium text-gray-900">
                      {{ userDisplayName }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ authStore.profile?.email || 'user@example.com' }}
                    </span>
                  </div>
                </div>
                <svg
                  class="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-2 z-20"
                  @click.stop
                >
                  <button
                    type="button"
                    class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    @click="handleProfile"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    @click="handleLogout"
                  >
                    Sign out
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <div class="px-6 py-4">
          <div class="max-w-6xl mx-auto space-y-6">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { $firebase } = useNuxtApp()
const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

if (process.client) {
  window.addEventListener('click', closeUserMenu)
  onBeforeUnmount(() => {
    window.removeEventListener('click', closeUserMenu)
  })
}

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/routes': 'Routes',
    '/trips': 'Trips',
    '/vehicles': 'Vehicles',
    '/tickets': 'Tickets',
    '/users': 'Users',
    '/reports': 'Reports',
  }
  return titles[route.path] || 'Admin Panel'
})

const activeMenuKey = computed(() => route.path)

const menuOptions = computed(() =>
  [
    { label: 'Dashboard', path: '/' },
    { label: 'Routes', path: '/routes' },
    { label: 'Trips', path: '/trips' },
    { label: 'Vehicles', path: '/vehicles' },
    { label: 'Tickets', path: '/tickets' },
    { label: 'Users', path: '/users', adminOnly: true },
    { label: 'Reports', path: '/reports' },
  ].filter((item) => !item.adminOnly || authStore.isAdmin)
)

const userInitial = computed(
  () =>
    authStore.profile?.displayName?.charAt(0) ||
    authStore.profile?.email?.charAt(0) ||
    'U'
)

const userDisplayName = computed(
  () =>
    authStore.profile?.displayName ||
    authStore.profile?.email ||
    'User'
)

const handleMenuSelect = (path: string) => {
  router.push(path)
}

const handleProfile = () => {
  closeUserMenu()
  router.push('/profile')
}

const handleLogout = async () => {
  closeUserMenu()
  await authStore.logout($firebase.auth)
  router.push('/login')
}
</script>

