<script setup lang="ts">
import { LogOut, ShieldCheck } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <div class="app-frame">
    <header class="app-header">
      <RouterLink class="brand" :to="{ name: 'orders' }" aria-label="Pharmacovigilance home">
        <span class="brand__mark"><ShieldCheck :size="22" /></span>
        <span>
          <strong>Pharmacovigilance</strong>
          <small>Medication safety operations</small>
        </span>
      </RouterLink>

      <div class="account-menu">
        <span class="account-menu__user">
          <small>Signed in as</small>
          <strong>{{ auth.user?.username }}</strong>
        </span>
        <button class="button button--ghost" type="button" @click="handleLogout">
          <LogOut :size="17" />
          <span>Sign out</span>
        </button>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
