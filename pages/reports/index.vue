<template>
  <div class="space-y-6">
    <header>
      <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Insights</p>
      <h1 class="text-3xl font-semibold text-gray-900">Reports</h1>
      <p class="text-sm text-gray-500">Monitor KPIs, visualize data, and export summaries.</p>
    </header>

    <section class="grid gap-4 md:grid-cols-2">
      <div class="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900">KPIs</h2>
        <p class="text-sm text-gray-500">Dashboard cards for daily/weekly performance will appear here.</p>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900">Charts</h2>
        <p class="text-sm text-gray-500">ECharts integration coming soon.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAdmin: true,
})
</script>

