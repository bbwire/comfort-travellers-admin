<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">403</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Access Forbidden</h2>
      <p class="text-gray-600 mb-8">
        You don't have permission to access this resource.
      </p>
      <n-button type="primary" @click="goHome">
        Go to Dashboard
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

