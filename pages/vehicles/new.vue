<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-2">
      <nav class="text-sm text-gray-500">
        <NuxtLink to="/vehicles" class="hover:text-gray-900">Vehicles</NuxtLink>
        <span class="mx-2 text-gray-300">/</span>
        <span>Add vehicle</span>
      </nav>
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-blue-600">Fleet</p>
        <h1 class="text-3xl font-semibold text-gray-900">Add vehicle</h1>
        <p class="text-sm text-gray-500">Register a bus and assign its crew before scheduling trips.</p>
      </div>
    </header>

    <form class="space-y-6 rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur" @submit.prevent="handleSubmit">
      <div class="grid gap-6 md:grid-cols-2">
        <BaseInput v-model="form.vehicleNumber" label="Vehicle Number" placeholder="e.g., UA651AN" required :error="errors.vehicleNumber" />

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">Status</label>
          <select
            v-model="form.status"
            required
            class="rounded-xl border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            :class="{ 'border-rose-300 bg-rose-50': errors.status }"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <p v-if="errors.status" class="text-xs text-rose-600">{{ errors.status }}</p>
        </div>
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700">Crew Members</label>
        <p class="text-xs text-gray-500">Add driver and conductor names. Leave empty if not assigned.</p>
        <div class="mt-3 space-y-3">
          <div v-for="(member, index) in crewInputs" :key="index" class="flex gap-3">
            <input
              v-model="crewInputs[index]"
              type="text"
              class="flex-1 rounded-xl border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
              placeholder="Crew member name"
            />
            <button
              type="button"
              class="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              @click="removeCrew(index)"
            >
              Remove
            </button>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 text-sm font-medium text-gray-700"
            @click="addCrew"
          >
            <span class="text-lg leading-none">＋</span>
            Add crew member
          </button>
        </div>
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          v-model="form.notes"
          rows="3"
          class="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
          placeholder="Maintenance notes, preferred routes, etc."
        ></textarea>
      </div>

      <label class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-700">
        <input v-model="form.isActive" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
        Vehicle is active and available for trips
      </label>

      <div class="flex flex-wrap gap-3">
        <button
          type="submit"
          class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="vehiclesStore.loading"
        >
          {{ vehiclesStore.loading ? 'Saving…' : 'Save vehicle' }}
        </button>
        <NuxtLink
          to="/vehicles"
          class="inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseInput from '~/components/BaseInput.vue'
import { validateVehicleInput, type VehicleValidationErrors } from '~/lib/validation/schemas'

definePageMeta({
  requiresAdmin: true,
})

const router = useRouter()
const vehiclesStore = useVehiclesStore()
const { $firebase } = useNuxtApp()

const form = reactive({
  vehicleNumber: '',
  status: 'online',
  crew: [] as string[],
  notes: '',
  isActive: true,
})

const errors = reactive<VehicleValidationErrors>({})
const crewInputs = ref<string[]>([''])

const addCrew = () => {
  crewInputs.value.push('')
}

const removeCrew = (index: number) => {
  crewInputs.value.splice(index, 1)
  if (!crewInputs.value.length) {
    crewInputs.value.push('')
  }
}

const handleSubmit = async () => {
  form.crew = crewInputs.value.filter((member) => member.trim())
  const validation = validateVehicleInput(form)
  if (!validation.success) {
    Object.assign(errors, validation.errors)
    return
  }

  const result = await vehiclesStore.createVehicle($firebase.firestore, validation.data)
  if (!result.success) {
    alert(result.error || 'Failed to save vehicle')
    return
  }

  router.push('/vehicles')
}
</script>

