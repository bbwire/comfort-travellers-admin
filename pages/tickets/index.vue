<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Operations</p>
        <h1 class="text-3xl font-semibold text-gray-900">Tickets</h1>
        <p class="text-sm text-gray-500">Search, track, and manage ticket lifecycle.</p>
      </div>
    </header>

    <section class="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div class="text-center text-sm text-gray-500">
        Ticket management UI coming soon. Planned features include advanced search/filtering, view/cancel/use actions, and audit trail.
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAdmin: true,
})
</script>

