<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Test Page</h1>
    <p class="text-gray-600 mb-4">If you can see this, basic rendering works.</p>
    
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">Plain HTML Input:</h2>
      <input type="text" placeholder="Test input" class="border p-2" />
    </div>

    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">Naive UI Button:</h2>
      <n-button type="primary">Naive UI Button</n-button>
    </div>

    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">Naive UI Input:</h2>
      <n-input placeholder="Naive UI Input" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>

