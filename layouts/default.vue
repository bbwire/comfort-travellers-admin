<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 h-full">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Comfort Travellers</h2>
          <p class="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav class="mt-4 px-2">
          <n-menu
            :options="menuOptions"
            :value="activeMenuKey"
            @update:value="handleMenuSelect"
          />
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 ml-64">
        <!-- Topbar -->
        <header class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ pageTitle }}
              </h1>
            </div>
            <div class="flex items-center gap-4">
              <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
                <n-button quaternary>
                  <div class="flex items-center gap-2">
                    <n-avatar round :size="32">
                      {{ authStore.profile?.displayName?.charAt(0) || authStore.profile?.email?.charAt(0) || 'U' }}
                    </n-avatar>
                    <span class="hidden md:inline">{{ authStore.profile?.displayName || authStore.profile?.email || 'User' }}</span>
                  </div>
                </n-button>
              </n-dropdown>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOption } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { $firebase } = useNuxtApp()

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

const menuOptions: MenuOption[] = [
  {
    label: 'Dashboard',
    key: '/',
  },
  {
    label: 'Routes',
    key: '/routes',
  },
  {
    label: 'Trips',
    key: '/trips',
  },
  {
    label: 'Vehicles',
    key: '/vehicles',
  },
  {
    label: 'Tickets',
    key: '/tickets',
  },
  {
    label: 'Users',
    key: '/users',
    show: authStore.isAdmin,
  },
  {
    label: 'Reports',
    key: '/reports',
  },
].filter((item) => item.show !== false) as MenuOption[]

const userMenuOptions = [
  {
    label: 'Profile',
    key: 'profile',
  },
  {
    label: 'Settings',
    key: 'settings',
  },
  {
    type: 'divider',
    key: 'divider',
  },
  {
    label: 'Sign out',
    key: 'logout',
  },
]

const handleMenuSelect = (key: string) => {
  router.push(key)
}

const handleUserMenuSelect = async (key: string) => {
  if (key === 'logout') {
    await authStore.logout($firebase.auth)
    router.push('/login')
  } else if (key === 'profile') {
    // Navigate to profile page when implemented
    console.log('Profile clicked')
  } else if (key === 'settings') {
    // Navigate to settings page when implemented
    console.log('Settings clicked')
  }
}
</script>

