<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Operations</p>
        <h1 class="text-3xl font-semibold text-gray-900">Routes</h1>
        <p class="text-sm text-gray-500">Manage scheduled routes, pricing, and availability.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          @click="handleResetFilters"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
          Reset Filters
        </button>
        <button
          v-if="authStore.isAdmin"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          @click="router.push('/routes/new')"
        >
          <span class="text-lg leading-none">＋</span>
          New Route
        </button>
      </div>
    </header>

    <section class="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Origin</label>
          <select
            v-model="filters.origin"
            class="rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            @change="handleFilterChange"
          >
            <option :value="undefined">All origins</option>
            <option v-for="origin in routesStore.distinctOrigins" :key="origin" :value="origin">
              {{ origin }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Destination</label>
          <select
            v-model="filters.destination"
            class="rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            @change="handleFilterChange"
          >
            <option :value="undefined">All destinations</option>
            <option v-for="destination in routesStore.distinctDestinations" :key="destination" :value="destination">
              {{ destination }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Status</label>
          <select
            v-model="filters.isActive"
            class="rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            @change="handleFilterChange"
          >
            <option :value="undefined">All statuses</option>
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Search</label>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by name, origin, destination"
            class="rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            @input="handleSearch"
          />
        </div>
      </div>
    </section>

    <div
      v-if="routesStore.error"
      class="flex items-start justify-between rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-700"
    >
      <span>{{ routesStore.error }}</span>
      <button type="button" class="text-lg leading-none" @click="routesStore.setError(null)">×</button>
    </div>

    <section class="rounded-3xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur">
      <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-gray-500">
        <span class="h-3 w-3 animate-pulse rounded-full bg-gray-400"></span>
        Loading routes…
      </div>

      <div v-else-if="isEmptyState" class="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <div class="rounded-full bg-gray-100 p-4 text-gray-500">
          <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">No routes found</h3>
        <p class="text-sm text-gray-500">Adjust filters or add a new route to get started.</p>
      </div>

      <div v-else class="overflow-hidden">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr class="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th class="px-6 py-3">Route</th>
                <th class="px-6 py-3">Origin</th>
                <th class="px-6 py-3">Destination</th>
                <th class="px-6 py-3">Base Price</th>
                <th class="px-6 py-3">Duration</th>
                <th class="px-6 py-3">Stops</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr
                v-for="route in filteredRoutes"
                :key="route.id"
                class="transition hover:bg-gray-50/80"
              >
                <td class="px-6 py-4 font-medium text-gray-900">{{ route.name }}</td>
                <td class="px-6 py-4">{{ route.origin }}</td>
                <td class="px-6 py-4">{{ route.destination }}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">
                  UGX {{ new Intl.NumberFormat('en-US').format(route.basePrice) }}
                </td>
                <td class="px-6 py-4">
                  {{ route.estimatedDurationMinutes || '—' }} min
                </td>
                <td class="px-6 py-4">
                  <span v-if="route.stops?.length">{{ route.stops.join(', ') }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    :class="route.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'"
                  >
                    <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="route.isActive ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    {{ route.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                      @click="router.push(`/routes/${route.id}`)"
                    >
                      Edit
                    </button>
                    <button
                      v-if="authStore.isAdmin"
                      type="button"
                      class="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      @click="handleDelete(route.id, route.name)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="routesStore.hasMore" class="border-t border-gray-100 bg-gray-50/70 px-6 py-4 text-center">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="routesStore.loading"
            @click="handleLoadMore"
          >
            {{ routesStore.loading ? 'Loading…' : 'Load more routes' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  requiresAdmin: true,
})

const router = useRouter()
const authStore = useAuthStore()
const routesStore = useRoutesStore()
const { $firebase } = useNuxtApp()

const searchTerm = ref('')

const filters = computed({
  get: () => routesStore.filters,
  set: (value) => routesStore.setFilters(value),
})

const isLoading = computed(() => routesStore.loading)
const isEmptyState = computed(() => !routesStore.loading && routesStore.routes.length === 0)

const filteredRoutes = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  if (!query) return routesStore.routes

  return routesStore.routes.filter((route) => {
    return (
      route.name.toLowerCase().includes(query) ||
      route.origin.toLowerCase().includes(query) ||
      route.destination.toLowerCase().includes(query)
    )
  })
})

const handleSearch = async () => {
  await routesStore.fetchRoutes($firebase.firestore, true)
}

const handleFilterChange = async () => {
  await routesStore.fetchRoutes($firebase.firestore, true)
}

const handleResetFilters = async () => {
  routesStore.resetFilters()
  searchTerm.value = ''
  await routesStore.fetchRoutes($firebase.firestore, true)
}

const handleLoadMore = async () => {
  await routesStore.loadMore($firebase.firestore)
}

const handleDelete = async (routeId: string, routeName: string) => {
  if (!confirm(`Delete "${routeName}"? This action cannot be undone.`)) return

  const result = await routesStore.deleteRoute($firebase.firestore, routeId)
  if (!result.success) {
    alert(result.error || 'Failed to delete route')
  }
}

onMounted(async () => {
  await Promise.all([
    routesStore.fetchFilterOptions($firebase.firestore),
    routesStore.fetchRoutes($firebase.firestore, true),
  ])
})
</script>
