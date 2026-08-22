<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockKeyhole, ShieldAlert } from '@lucide/vue'
import { getErrorMessage, getFieldErrors } from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const errors = ref<Record<string, string[]>>({})
const generalError = ref('')
const submitting = ref(false)

async function submit() {
  errors.value = {}
  generalError.value = ''

  if (!username.value.trim()) errors.value.username = ['Username is required.']
  if (!password.value) errors.value.password = ['Password is required.']
  if (Object.keys(errors.value).length) return

  submitting.value = true
  try {
    await auth.login(username.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
    await router.replace(redirect ?? { name: 'orders' })
  } catch (error) {
    errors.value = getFieldErrors(error)
    generalError.value = getErrorMessage(error, 'Unable to sign in. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card" aria-labelledby="login-title">
      <span class="login-card__icon"><LockKeyhole :size="25" /></span>
      <p class="eyebrow">Pharmacovigilance</p>
      <h1 id="login-title">Pharmacovigilance Alert System</h1>
      <p>Sign in to search affected orders and notify customers.</p>

      <form class="login-form" novalidate @submit.prevent="submit">
        <div v-if="generalError" class="alert-box" role="alert">
          <ShieldAlert :size="18" />
          <span>{{ generalError }}</span>
        </div>

        <div class="field">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            name="username"
            autocomplete="username"
            :aria-invalid="Boolean(errors.username)"
            :aria-describedby="errors.username ? 'username-error' : undefined"
          />
          <p v-if="errors.username" id="username-error" class="field__error">
            {{ errors.username[0] }}
          </p>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'password-error' : undefined"
          />
          <p v-if="errors.password" id="password-error" class="field__error">
            {{ errors.password[0] }}
          </p>
        </div>

        <button class="button button--primary button--full" type="submit" :disabled="submitting">
          <span v-if="submitting" class="spinner" aria-hidden="true"></span>
          {{ submitting ? 'Logging in…' : 'Login' }}
        </button>
      </form>
    </section>
  </main>
</template>
