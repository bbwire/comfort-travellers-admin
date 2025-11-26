<template>
  <div class="space-y-6">
    <header>
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        @click="router.back()"
      >
        <span class="-ml-1 text-lg">←</span>
        Back to Trips
      </button>
      <h1 class="mt-2 text-3xl font-semibold text-gray-900">Create Trip</h1>
      <p class="text-sm text-gray-500">Schedule departures, assign vehicles, and track seats.</p>
    </header>

    <div
      v-if="tripsStore.error"
      class="flex items-start justify-between rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-700"
    >
      <span>{{ tripsStore.error }}</span>
      <button type="button" class="text-lg leading-none" @click="tripsStore.setError(null)">×</button>
    </div>

    <section class="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="grid gap-6 md:grid-cols-2">
          <BaseInput
            v-model="formData.title"
            label="Trip title"
            placeholder="Morning Shuttle"
            :disabled="loading"
            :error="errors.title"
            required
            @clear-error="errors.title = ''"
          />

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Route</label>
            <select
              v-model="formData.routeId"
              class="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              :disabled="loading || !routeOptions.length"
              @change="errors.routeId = ''"
              required
            >
              <option value="" disabled>Select route</option>
              <option v-for="route in routeOptions" :key="route.id" :value="route.id">
                {{ route.name }}
              </option>
            </select>
            <p v-if="errors.routeId" class="text-xs text-red-600">{{ errors.routeId }}</p>
            <p v-else-if="!routeOptions.length" class="text-xs text-gray-500">Loading routes…</p>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Vehicle</label>
            <select
              v-model="formData.vehicleId"
              class="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              :disabled="loading || !vehicleOptions.length"
              @change="errors.vehicleId = ''"
              required
            >
              <option value="" disabled>Select vehicle</option>
              <option v-for="vehicle in vehicleOptions" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.label }}
              </option>
            </select>
            <p v-if="errors.vehicleId" class="text-xs text-red-600">{{ errors.vehicleId }}</p>
            <p v-else-if="!vehicleOptions.length" class="text-xs text-gray-500">Loading vehicles…</p>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <BaseInput
            v-model="formData.departureTime"
            label="Departure time"
            type="datetime-local"
            :disabled="loading"
            :error="errors.departureTime"
            required
            @clear-error="errors.departureTime = ''"
          />

          <BaseInput
            v-model="formData.arrivalTime"
            label="Arrival time"
            type="datetime-local"
            :disabled="loading"
            :error="errors.arrivalTime"
            required
            @clear-error="errors.arrivalTime = ''"
          />
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <BaseInput
            v-model="formData.totalSeats"
            label="Seat capacity"
            type="number"
            min="0"
            placeholder="45"
            :disabled="loading"
            :error="errors.totalSeats"
            required
            @clear-error="errors.totalSeats = ''"
          />

          <BaseInput
            v-model="formData.seatsBooked"
            label="Booked seats"
            type="number"
            min="0"
            placeholder="0"
            :disabled="loading"
            :error="errors.seatsBooked"
            required
            @clear-error="errors.seatsBooked = ''"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">Available seats (comma separated)</label>
          <textarea
            v-model="formData.availableSeatsText"
            rows="2"
            placeholder="e.g. 1,2,3,5"
            class="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
            :disabled="loading"
            @focus="errors.availableSeats = ''"
          />
          <p v-if="errors.availableSeats" class="text-xs text-red-600">{{ errors.availableSeats }}</p>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="formData.status"
              class="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
            >
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              v-model="formData.notes"
              rows="3"
              placeholder="Optional notes"
              class="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3 pt-4 sm:flex-row">
          <button
            type="submit"
            class="inline-flex flex-1 items-center justify-center rounded-2xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
          >
            {{ loading ? 'Creating…' : 'Create trip' }}
          </button>
          <button
            type="button"
            class="inline-flex flex-1 items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            :disabled="loading"
            @click="router.back()"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { validateTripInput, type TripValidationErrors } from '~/lib/validation/schemas'

definePageMeta({
  requiresAdmin: true,
})

const router = useRouter()
const tripsStore = useTripsStore()
const routesStore = useRoutesStore()
const vehiclesStore = useVehiclesStore()
const { $firebase } = useNuxtApp()

const loading = ref(false)
const errors = reactive({
  title: '',
  routeId: '',
  vehicleId: '',
  departureTime: '',
  arrivalTime: '',
  totalSeats: '',
  seatsBooked: '',
  availableSeats: '',
})

const formData = reactive({
  title: '',
  routeId: '',
  vehicleId: '',
  departureTime: '',
  arrivalTime: '',
  totalSeats: 40,
  seatsBooked: 0,
  status: 'scheduled' as 'scheduled' | 'active' | 'completed' | 'cancelled',
  notes: '',
  availableSeatsText: '',
  vehicleNumber: '',
})

const routeOptions = computed(() =>
  routesStore.routes.map((route) => ({
    id: route.id,
    name: route.name,
  }))
)

const vehicleOptions = computed(() =>
  vehiclesStore.vehicles.map((vehicle) => ({
    id: vehicle.id,
    label: `${vehicle.vehicleNumber || vehicle.id} · ${vehicle.status}`,
  }))
)

const ensureDataLoaded = async () => {
  if (!routesStore.routes.length) {
    await routesStore.fetchRoutes($firebase.firestore, true)
  }
  if (!vehiclesStore.vehicles.length) {
    await vehiclesStore.fetchVehicles($firebase.firestore, true)
  }
}

const applyValidationErrors = (validationErrors: TripValidationErrors = {}) => {
  errors.title = validationErrors.title || ''
  errors.routeId = validationErrors.routeId || ''
  errors.vehicleId = validationErrors.vehicleId || ''
  errors.departureTime = validationErrors.departureTime || ''
  errors.arrivalTime = validationErrors.arrivalTime || ''
  errors.totalSeats = validationErrors.totalSeats || ''
  errors.seatsBooked = validationErrors.seatsBooked || ''
  errors.availableSeats = validationErrors.availableSeats || ''
}

const handleSubmit = async () => {
  const availableSeats = formData.availableSeatsText
    .split(',')
    .map((seat) => seat.trim())
    .filter((seat) => seat.length > 0)
    .map((seat) => Number(seat))
    .filter((seat) => Number.isFinite(seat))

  const validationResult = validateTripInput({
    ...formData,
    availableSeats,
  })

  if (!validationResult.success) {
    applyValidationErrors(validationResult.errors)
    return
  }

  applyValidationErrors()
  loading.value = true

  try {
    const result = await tripsStore.createTrip($firebase.firestore, validationResult.data)

    if (result.success) {
      router.push('/trips')
    } else {
      alert(result.error || 'Failed to create trip')
    }
  } catch (error: any) {
    alert(error.message || 'Failed to create trip')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await ensureDataLoaded()
})

watch(
  () => formData.vehicleId,
  (vehicleId) => {
    const selected = vehiclesStore.vehicles.find((vehicle) => vehicle.id === vehicleId)
    formData.vehicleNumber = selected?.vehicleNumber || ''
  }
)
</script>

