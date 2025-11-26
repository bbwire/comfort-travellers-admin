<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Admin</p>
        <h1 class="text-3xl font-semibold text-gray-900">Users</h1>
        <p class="text-sm text-gray-500">Review user accounts, change roles, and deactivate access.</p>
      </div>
    </header>

    <section class="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Role</label>
          <select
            v-model="roleFilter"
            class="rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
            @change="handleFilterChange"
          >
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-600">Status</label>
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
      v-if="usersStore.error"
      class="flex items-start justify-between rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-700"
    >
      <span>{{ usersStore.error }}</span>
      <button type="button" class="text-lg leading-none" @click="usersStore.setError(null)">×</button>
    </div>

    <section class="rounded-3xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur">
      <div v-if="usersStore.loading" class="flex flex-col items-center justify-center gap-3 px-6 py-14 text-gray-500">
        <span class="h-3 w-3 animate-pulse rounded-full bg-gray-400"></span>
        Loading users…
      </div>

      <div
        v-else-if="!usersStore.users.length"
        class="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center text-sm text-gray-500"
      >
        No users found. Users appear here after they sign in via Firebase Auth.
      </div>

      <div v-else class="overflow-hidden">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-6 py-3 text-left">User</th>
                <th class="px-6 py-3 text-left">Role</th>
                <th class="px-6 py-3 text-left">Status</th>
                <th class="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr
                v-for="user in usersStore.users"
                :key="user.id"
                class="transition hover:bg-gray-50/80"
              >
                <td class="px-6 py-4">
                  <div class="font-semibold text-gray-900">
                    {{ user.displayName || user.email || 'Unknown user' }}
                  </div>
                  <div class="text-xs text-gray-500">{{ user.email || '—' }}</div>
                  <div class="mt-1 text-xs text-gray-400">ID: {{ user.id }}</div>
                </td>
                <td class="px-6 py-4 capitalize">
                  {{ user.role }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    :class="user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    <select
                      v-model="roleSelections[user.id]"
                      class="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs"
                      @change="handleRoleChange(user.id)"
                    >
                      <option value="admin">Admin</option>
                      <option value="agent">Agent</option>
                      <option value="customer">Customer</option>
                    </select>
                    <button
                      type="button"
                      class="rounded-lg border px-3 py-1 text-xs font-medium transition"
                      :class="user.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'"
                      @click="toggleActive(user)"
                    >
                      {{ user.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="usersStore.hasMore" class="border-t border-gray-100 bg-gray-50/70 px-6 py-4 text-center">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="usersStore.loading"
            @click="usersStore.fetchUsers($firebase.firestore, false)"
          >
            {{ usersStore.loading ? 'Loading…' : 'Load more users' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

definePageMeta({
  requiresAdmin: true,
})

const usersStore = useUsersStore()
const { $firebase } = useNuxtApp()

const roleFilter = ref('')
const activeFilter = ref('')
const roleSelections = reactive<Record<string, string>>({})

const filters = computed({
  get: () => usersStore.filters,
  set: (value) => usersStore.setFilters(value),
})

const handleFilterChange = async () => {
  usersStore.setFilters({
    role: (roleFilter.value || undefined) as any,
    isActive: activeFilter.value === '' ? undefined : activeFilter.value === 'true',
  })
  await usersStore.fetchUsers($firebase.firestore, true)
  initializeRoleSelections()
}

const handleResetFilters = async () => {
  roleFilter.value = ''
  activeFilter.value = ''
  usersStore.resetFilters()
  await usersStore.fetchUsers($firebase.firestore, true)
  initializeRoleSelections()
}

const initializeRoleSelections = () => {
  usersStore.users.forEach((user) => {
    roleSelections[user.id] = user.role
  })
}

const handleRoleChange = async (userId: string) => {
  const newRole = roleSelections[userId] as any
  const confirmed = confirm(`Change role for this user to "${newRole}"?`)
  if (!confirmed) {
    const user = usersStore.users.find((u) => u.id === userId)
    if (user) roleSelections[userId] = user.role
    return
  }
  const result = await usersStore.updateUserRole($firebase.firestore, userId, newRole)
  if (!result.success) {
    alert(result.error || 'Failed to update role')
    const user = usersStore.users.find((u) => u.id === userId)
    if (user) roleSelections[userId] = user.role
  }
}

const toggleActive = async (user: any) => {
  const targetState = !user.isActive
  const label = targetState ? 'activate' : 'deactivate'
  if (!confirm(`Are you sure you want to ${label} this user?`)) return

  const result = await usersStore.updateUserActive($firebase.firestore, user.id, targetState)
  if (!result.success) {
    alert(result.error || 'Failed to update status')
  }
}

onMounted(async () => {
  await usersStore.fetchUsers($firebase.firestore, true)
  initializeRoleSelections()
})
</script>

