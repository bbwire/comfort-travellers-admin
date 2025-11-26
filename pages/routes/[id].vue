<template>
  <div style="padding: 20px;">
    <!-- Header -->
    <div style="margin-bottom: 24px;">
      <button
        @click="router.push('/routes')"
        style="background: none; border: none; color: #2563eb; cursor: pointer; font-size: 0.875rem; margin-bottom: 16px; padding: 0;"
        @mouseover="(e) => (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'"
        @mouseout="(e) => (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'"
      >
        ← Back to Routes
      </button>
      <h1 style="font-size: 24px; font-weight: 600; margin: 0;">{{ loading ? 'Loading...' : 'Edit Route' }}</h1>
    </div>

    <!-- Error message -->
    <div
      v-if="routesStore.error"
      style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;"
    >
      <span>{{ routesStore.error }}</span>
      <button
        @click="routesStore.setError(null)"
        style="background: none; border: none; color: #991b1b; cursor: pointer; font-size: 1.25rem; padding: 0; margin-left: 1rem;"
      >
        ×
      </button>
    </div>

    <!-- Form -->
    <div v-if="!loading && currentRoute" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
      <form @submit.prevent="handleSubmit">
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Route Name <span style="color: #ef4444;">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Enter route name"
            required
            :disabled="saving"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; outline: none; box-sizing: border-box;"
            :style="{ borderColor: errors.name ? '#ef4444' : '#d1d5db' }"
            @focus="(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = '#2563eb'; errors.name = '' }"
            @blur="(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#d1d5db'"
          />
          <p v-if="errors.name" style="color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; margin-bottom: 0;">{{ errors.name }}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Origin <span style="color: #ef4444;">*</span>
          </label>
          <input
            v-model="formData.origin"
            type="text"
            placeholder="Enter origin city"
            required
            :disabled="saving"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; outline: none; box-sizing: border-box;"
            :style="{ borderColor: errors.origin ? '#ef4444' : '#d1d5db' }"
            @focus="(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = '#2563eb'; errors.origin = '' }"
            @blur="(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#d1d5db'"
          />
          <p v-if="errors.origin" style="color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; margin-bottom: 0;">{{ errors.origin }}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Destination <span style="color: #ef4444;">*</span>
          </label>
          <input
            v-model="formData.destination"
            type="text"
            placeholder="Enter destination city"
            required
            :disabled="saving"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; outline: none; box-sizing: border-box;"
            :style="{ borderColor: errors.destination ? '#ef4444' : '#d1d5db' }"
            @focus="(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = '#2563eb'; errors.destination = '' }"
            @blur="(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#d1d5db'"
          />
          <p v-if="errors.destination" style="color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; margin-bottom: 0;">{{ errors.destination }}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Base Price (UGX) <span style="color: #ef4444;">*</span>
          </label>
          <input
            v-model.number="formData.basePrice"
            type="number"
            placeholder="Enter base price"
            min="0"
            step="1"
            required
            :disabled="saving"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; outline: none; box-sizing: border-box;"
            :style="{ borderColor: errors.basePrice ? '#ef4444' : '#d1d5db' }"
            @focus="(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = '#2563eb'; errors.basePrice = '' }"
            @blur="(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#d1d5db'"
          />
          <p v-if="errors.basePrice" style="color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; margin-bottom: 0;">{{ errors.basePrice }}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Duration (minutes) <span style="color: #ef4444;">*</span>
          </label>
          <input
            v-model.number="formData.estimatedDurationMinutes"
            type="number"
            min="1"
            placeholder="240"
            required
            :disabled="saving"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; outline: none; box-sizing: border-box;"
            :style="{ borderColor: errors.estimatedDurationMinutes ? '#ef4444' : '#d1d5db' }"
            @focus="(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = '#2563eb'; errors.estimatedDurationMinutes = '' }"
            @blur="(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#d1d5db'"
          />
          <p v-if="errors.estimatedDurationMinutes" style="color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; margin-bottom: 0;">
            {{ errors.estimatedDurationMinutes }}
          </p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Stops (Optional)
          </label>
          <div v-for="(stop, index) in formData.stops" :key="index" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input
              v-model="formData.stops[index]"
              type="text"
              :placeholder="`Stop ${index + 1}`"
              :disabled="saving"
              style="flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; outline: none; box-sizing: border-box;"
              @focus="(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#2563eb'"
              @blur="(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#d1d5db'"
            />
            <button
              type="button"
              @click="formData.stops.splice(index, 1)"
              :disabled="saving"
              style="padding: 0.75rem 1rem; border: 1px solid #fecaca; background: white; color: #991b1b; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem;"
              @mouseover="(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2'"
              @mouseout="(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white'"
            >
              Remove
            </button>
          </div>
          <button
            type="button"
            @click="formData.stops.push('')"
            :disabled="saving"
            style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; color: #374151;"
            @mouseover="(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'"
            @mouseout="(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white'"
          >
            + Add Stop
          </button>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151;">
            <input
              v-model="formData.isActive"
              type="checkbox"
              :disabled="saving"
              style="width: 1rem; height: 1rem; cursor: pointer;"
            />
            <span>Active</span>
          </label>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 2rem;">
          <button
            type="submit"
            :disabled="saving"
            style="background: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; cursor: pointer;"
            :style="{ opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }"
            @mouseover="(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1d4ed8' }"
            @mouseout="(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563eb' }"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
          <button
            type="button"
            @click="router.push('/routes')"
            :disabled="saving"
            style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; background: white; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; color: #374151;"
            @mouseover="(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'"
            @mouseout="(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white'"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Loading state -->
    <div v-if="loading" style="background: white; padding: 3rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
      Loading route...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  validateRouteInput,
  type RouteValidationErrors,
} from '~/lib/validation/schemas'
import type { Route } from '~/lib/repositories/routes.repository'

definePageMeta({
  requiresAdmin: true,
})

const route = useRoute()
const router = useRouter()
const routesStore = useRoutesStore()
const { $firebase } = useNuxtApp()

const loading = ref(true)
const saving = ref(false)
const errors = reactive({
  name: '',
  origin: '',
  destination: '',
  basePrice: '',
  estimatedDurationMinutes: '',
})

const routeId = computed(() => route.params.id as string)

const currentRoute = computed<Route | null>(() => routesStore.currentRoute)

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
  saving.value = true

  try {
    const result = await routesStore.updateRoute(
      $firebase.firestore,
      routeId.value,
      validationResult.data
    )

    if (result.success) {
      alert('Route updated successfully')
      router.push('/routes')
    } else {
      alert(result.error || 'Failed to update route')
    }
  } catch (error: any) {
    alert(error.message || 'Failed to update route')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await routesStore.fetchRouteById($firebase.firestore, routeId.value)

    if (currentRoute.value) {
      formData.name = currentRoute.value.name
      formData.origin = currentRoute.value.origin
      formData.destination = currentRoute.value.destination
      formData.basePrice = currentRoute.value.basePrice
      formData.estimatedDurationMinutes = currentRoute.value.estimatedDurationMinutes || 0
      formData.stops = currentRoute.value.stops || []
      formData.isActive = currentRoute.value.isActive
    }
  } catch (error: any) {
    alert(error.message || 'Failed to load route')
    router.push('/routes')
  } finally {
    loading.value = false
  }
})
</script>

