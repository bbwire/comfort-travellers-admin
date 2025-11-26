<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Operations</p>
        <h1 class="text-3xl font-semibold text-gray-900">Trips</h1>
        <p class="text-sm text-gray-500">Schedule departures, assign vehicles, and monitor seat availability.</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60"
        :disabled="!authStore.isAdmin"
        @click="router.push('/trips/new')"
      >
        <span class="text-lg leading-none">＋</span>
        New Trip
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
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Route</label>
          <select
            v-model="routeFilterId"
            class="rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            @change="handleFilterChange"
          >
            <option value="">All routes</option>
            <option
              v-for="route in routesStore.routes"
              :key="route.id"
              :value="route.id"
            >
              {{ route.name }}
            </option>
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
      v-if="tripsStore.error"
      class="flex items-start justify-between rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-700"
    >
      <span>{{ tripsStore.error }}</span>
      <button type="button" class="text-lg leading-none" @click="tripsStore.setError(null)">×</button>
    </div>

    <section class="rounded-3xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur">
      <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 px-6 py-14 text-gray-500">
        <span class="h-3 w-3 animate-pulse rounded-full bg-gray-400"></span>
        Loading trips…
      </div>

      <div
        v-else-if="!isLoading && !tripsStore.trips.length"
        class="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center text-sm text-gray-500"
      >
        No trips found. Create the first trip to begin scheduling.
      </div>

      <div v-else class="overflow-hidden">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-6 py-3 text-left">Trip</th>
                <th class="px-6 py-3 text-left">Route</th>
                <th class="px-6 py-3 text-left">Vehicle</th>
                <th class="px-6 py-3 text-left">Departure</th>
                <th class="px-6 py-3 text-left">Arrival</th>
                <th class="px-6 py-3 text-left">Seats</th>
                <th class="px-6 py-3 text-left">Status</th>
                <th class="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr
                v-for="trip in tripsStore.trips"
                :key="trip.id"
                class="transition hover:bg-gray-50/80"
              >
                <td class="px-6 py-4 font-semibold text-gray-900">
                  <div>{{ formatTripLabel(trip) }}</div>
                  <div class="text-xs text-gray-500">{{ trip.title }}</div>
                </td>
                <td class="px-6 py-4">{{ routeLabelMap[trip.routeId] || trip.routeId || '—' }}</td>
                <td class="px-6 py-4">{{ vehicleLabelMap[trip.vehicleId] || trip.vehicleNumber || trip.vehicleId || '—' }}</td>
                <td class="px-6 py-4">{{ formatDate(trip.departureTime) }}</td>
                <td class="px-6 py-4">{{ formatDate(trip.arrivalTime) }}</td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium">
                    {{ trip.seatsBooked }} / {{ trip.totalSeats }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Available: {{ trip.availableSeats?.length ?? 0 }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    :class="statusPillClasses(trip.status)"
                  >
                    {{ trip.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                      @click="router.push(`/trips/${trip.id}`)"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      @click="handleDelete(trip.id, trip.title)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="tripsStore.hasMore" class="border-t border-gray-100 bg-gray-50/70 px-6 py-4 text-center">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="tripsStore.loading"
            @click="handleLoadMore"
          >
            {{ tripsStore.loading ? 'Loading…' : 'Load more trips' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  requiresAdmin: true,
})

const router = useRouter()
const authStore = useAuthStore()
const tripsStore = useTripsStore()
const routesStore = useRoutesStore()
const vehiclesStore = useVehiclesStore()
const { $firebase } = useNuxtApp()

const routeFilterId = ref('')

const filters = computed({
  get: () => tripsStore.filters,
  set: (value) => tripsStore.setFilters(value),
})

const routeLabelMap = computed(() => {
  const map: Record<string, string> = {}
  routesStore.routes.forEach((route) => {
    map[route.id] = route.name
    map[route.name] = route.name
  })
  map[''] = ''
  return map
})

const vehicleLabelMap = computed(() => {
  const map: Record<string, string> = {}
  vehiclesStore.vehicles.forEach((vehicle) => {
    map[vehicle.id] = vehicle.vehicleNumber || vehicle.id
  })
  return map
})

const isLoading = computed(() => tripsStore.loading)

const statusPillClasses = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700'
    case 'completed':
      return 'bg-slate-100 text-slate-600'
    case 'cancelled':
      return 'bg-rose-50 text-rose-700'
    default:
      return 'bg-blue-50 text-blue-700'
  }
}

const formatDate = (value: string) => {
  if (!value) return '—'
  return dayjs(value).format('MMM D, YYYY h:mm A')
}

const handleFilterChange = async () => {
  tripsStore.setFilters({ status: filters.value.status, routeId: routeFilterId.value || undefined })
  await tripsStore.fetchTrips($firebase.firestore, true)
}

const handleResetFilters = async () => {
  routeFilterId.value = ''
  tripsStore.resetFilters()
  await tripsStore.fetchTrips($firebase.firestore, true)
}

const handleLoadMore = async () => {
  await tripsStore.fetchTrips($firebase.firestore, false)
}

const formatTripLabel = (trip: typeof tripsStore.trips[number]) => {
  const routeLabel = routeLabelMap.value[trip.routeId] || trip.routeId || 'Unnamed route'
  const start = trip.departureTime ? dayjs(trip.departureTime).format('h:mm A') : '–'
  const end = trip.arrivalTime ? dayjs(trip.arrivalTime).format('h:mm A') : '–'
  return `${routeLabel} (${start} - ${end})`
}

const handleDelete = async (tripId: string, tripName: string) => {
  if (!confirm(`Delete "${tripName}"? This action cannot be undone.`)) return
  const result = await tripsStore.deleteTrip($firebase.firestore, tripId)
  if (!result.success) {
    alert(result.error || 'Failed to delete trip')
  }
}

onMounted(async () => {
  if (!routesStore.routes.length) {
    await routesStore.fetchRoutes($firebase.firestore, true)
  }
  if (!vehiclesStore.vehicles.length) {
    await vehiclesStore.fetchVehicles($firebase.firestore, true)
  }
  await tripsStore.fetchTrips($firebase.firestore, true)
})
</script>

