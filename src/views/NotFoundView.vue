<script setup lang="ts">
import { FileQuestion } from '@lucide/vue'
</script>

<template>
  <main class="centered-page">
    <section class="empty-panel">
      <FileQuestion :size="42" aria-hidden="true" />
      <p class="eyebrow">404 error</p>
      <h1>Page not found</h1>
      <p>The requested pharmacovigilance page does not exist.</p>
      <RouterLink class="button button--primary" :to="{ name: 'orders' }"
        >Return to search</RouterLink
      >
    </section>
  </main>
</template>
