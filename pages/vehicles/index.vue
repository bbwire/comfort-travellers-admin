<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Fleet</p>
        <h1 class="text-3xl font-semibold text-gray-900">Vehicles</h1>
        <p class="text-sm text-gray-500">Manage vehicle availability, crew assignments, and maintenance status.</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60"
        :disabled="!authStore.isAdmin"
        @click="router.push('/vehicles/new')"
      >
        <span class="text-lg leading-none">＋</span>
        Add Vehicle
      </button>
    </header>

    <section class="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Status</label>
          <select
            v-model="filters.status"
            class="rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            @change="handleFilterChange"
          >
            <option :value="undefined">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Active</label>
          <select
            v-model="activeFilter"
            class="rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            @change="handleFilterChange"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            @click="handleResetFilters"
          >
            Reset filters
          </button>
        </div>
      </div>
    </section>

    <div
      v-if="vehiclesStore.error"
      class="flex items-start justify-between rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-700"
    >
      <span>{{ vehiclesStore.error }}</span>
      <button type="button" class="text-lg leading-none" @click="vehiclesStore.setError(null)">×</button>
    </div>

    <section class="rounded-3xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur">
      <div v-if="vehiclesStore.loading" class="flex flex-col items-center justify-center gap-3 px-6 py-14 text-gray-500">
        <span class="h-3 w-3 animate-pulse rounded-full bg-gray-400"></span>
        Loading vehicles…
      </div>

      <div
        v-else-if="!vehiclesStore.vehicles.length"
        class="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center text-sm text-gray-500"
      >
        No vehicles found. Add the first vehicle to begin assigning buses to routes.
      </div>

      <div v-else class="overflow-hidden">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-6 py-3 text-left">Vehicle</th>
                <th class="px-6 py-3 text-left">Status</th>
                <th class="px-6 py-3 text-left">Crew</th>
                <th class="px-6 py-3 text-left">Notes</th>
                <th class="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr
                v-for="vehicle in vehiclesStore.vehicles"
                :key="vehicle.id"
                class="transition hover:bg-gray-50/80"
              >
                <td class="px-6 py-4 font-semibold text-gray-900">
                  {{ vehicle.vehicleNumber }}
                  <span
                    v-if="!vehicle.isActive"
                    class="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                  >
                    inactive
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize"
                    :class="statusPillClasses(vehicle.status)"
                  >
                    {{ vehicle.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div v-if="vehicle.crew?.length">
                    {{ vehicle.crew.join(', ') }}
                  </div>
                  <div v-else class="text-gray-400">—</div>
                </td>
                <td class="px-6 py-4 text-gray-500">
                  {{ vehicle.notes || '—' }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                      @click="router.push(`/vehicles/${vehicle.id}`)"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      @click="handleDelete(vehicle.id, vehicle.vehicleNumber)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="vehiclesStore.hasMore" class="border-t border-gray-100 bg-gray-50/70 px-6 py-4 text-center">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="vehiclesStore.loading"
            @click="vehiclesStore.fetchVehicles($firebase.firestore, false)"
          >
            {{ vehiclesStore.loading ? 'Loading…' : 'Load more vehicles' }}
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
const vehiclesStore = useVehiclesStore()
const { $firebase } = useNuxtApp()

const activeFilter = ref('')

const filters = computed({
  get: () => vehiclesStore.filters,
  set: (value) => vehiclesStore.setFilters(value),
})

const statusPillClasses = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-emerald-50 text-emerald-700'
    case 'maintenance':
      return 'bg-amber-50 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

const handleFilterChange = async () => {
  vehiclesStore.setFilters({
    status: filters.value.status,
    isActive: activeFilter.value === '' ? undefined : activeFilter.value === 'true',
  })
  await vehiclesStore.fetchVehicles($firebase.firestore, true)
}

const handleResetFilters = async () => {
  activeFilter.value = ''
  vehiclesStore.resetFilters()
  await vehiclesStore.fetchVehicles($firebase.firestore, true)
}

const handleDelete = async (vehicleId: string, label: string) => {
  if (!confirm(`Delete "${label}"? This action cannot be undone.`)) return
  const result = await vehiclesStore.deleteVehicle($firebase.firestore, vehicleId)
  if (!result.success) {
    alert(result.error || 'Failed to delete vehicle')
  }
}

onMounted(async () => {
  await vehiclesStore.fetchVehicles($firebase.firestore, true)
})
</script>

