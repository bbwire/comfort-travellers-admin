<template>
  <div class="space-y-6">
    <header>
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        @click="router.back()"
      >
        <span class="-ml-1 text-lg">←</span>
        Back to Routes
      </button>
      <h1 class="mt-2 text-3xl font-semibold text-gray-900">Create Route</h1>
      <p class="text-sm text-gray-500">Define origin, destination, pricing, and optional stops.</p>
    </header>

    <div
      v-if="routesStore.error"
      class="flex items-start justify-between rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-700"
    >
      <span>{{ routesStore.error }}</span>
      <button type="button" class="text-lg leading-none" @click="routesStore.setError(null)">×</button>
    </div>

    <section class="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="grid gap-6 md:grid-cols-2">
          <BaseInput
            v-model="formData.name"
            label="Route name"
            placeholder="Kampala → Jinja"
            :disabled="loading"
            :error="errors.name"
            required
            @clear-error="errors.name = ''"
          />

          <BaseInput
            v-model="formData.basePrice"
            label="Base price (UGX)"
            placeholder="25,000"
            type="number"
            min="0"
            :disabled="loading"
            :error="errors.basePrice"
            required
            @clear-error="errors.basePrice = ''"
          />

          <BaseInput
            v-model="formData.estimatedDurationMinutes"
            label="Duration (minutes)"
            type="number"
            min="1"
            placeholder="240"
            :disabled="loading"
            :error="errors.estimatedDurationMinutes"
            required
            @clear-error="errors.estimatedDurationMinutes = ''"
          />

          <BaseInput
            v-model="formData.origin"
            label="Origin"
            placeholder="Start city"
            :disabled="loading"
            :error="errors.origin"
            required
            @clear-error="errors.origin = ''"
          />

          <BaseInput
            v-model="formData.destination"
            label="Destination"
            placeholder="End city"
            :disabled="loading"
            :error="errors.destination"
            required
            @clear-error="errors.destination = ''"
          />
        </div>

        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-700">Stops (optional)</label>
          <div v-if="!formData.stops.length" class="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            Add the first stop to build an itinerary.
          </div>
          <div v-for="(stop, index) in formData.stops" :key="index" class="flex items-center gap-3">
            <input
              v-model="formData.stops[index]"
              type="text"
              :placeholder="`Stop ${index + 1}`"
              class="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
              :disabled="loading"
            />
            <button
              type="button"
              class="rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
              :disabled="loading"
              @click="formData.stops.splice(index, 1)"
            >
              Remove
            </button>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            :disabled="loading"
            @click="formData.stops.push('')"
          >
            + Add Stop
          </button>
        </div>

        <label class="inline-flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
          <input
            v-model="formData.isActive"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-800"
            :disabled="loading"
          />
          Route is active and bookable
        </label>

        <div class="flex flex-col gap-3 pt-4 sm:flex-row">
          <button
            type="submit"
            class="inline-flex flex-1 items-center justify-center rounded-2xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
          >
            {{ loading ? 'Creating...' : 'Create route' }}
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  validateRouteInput,
  type RouteValidationErrors,
} from '~/lib/validation/schemas'

definePageMeta({
  requiresAdmin: true,
})

const router = useRouter()
const routesStore = useRoutesStore()
const { $firebase } = useNuxtApp()

const loading = ref(false)
const errors = reactive({
  name: '',
  origin: '',
  destination: '',
  basePrice: '',
  estimatedDurationMinutes: '',
})

const formData = reactive({
  name: '',
  origin: '',
  destination: '',
  basePrice: 0,
  estimatedDurationMinutes: 60,
  stops: [] as string[],
  isActive: true,
})

const applyValidationErrors = (validationErrors: RouteValidationErrors = {}) => {
  errors.name = validationErrors.name || ''
  errors.origin = validationErrors.origin || ''
  errors.destination = validationErrors.destination || ''
  errors.basePrice = validationErrors.basePrice || ''
  errors.estimatedDurationMinutes = validationErrors.estimatedDurationMinutes || ''
}

const handleSubmit = async () => {
  const validationResult = validateRouteInput({
    ...formData,
    stops: formData.stops,
  })

  if (!validationResult.success) {
    applyValidationErrors(validationResult.errors)
    return
  }

  applyValidationErrors()
  loading.value = true

  try {
    const result = await routesStore.createRoute(
      $firebase.firestore,
      validationResult.data
    )

    if (result.success) {
      alert('Route created successfully')
      router.push('/routes')
    } else {
      alert(result.error || 'Failed to create route')
    }
  } catch (error: any) {
    alert(error.message || 'Failed to create route')
  } finally {
    loading.value = false
  }
}
</script>
