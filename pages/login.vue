<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; padding: 1rem;">
    <div style="max-width: 28rem; width: 100%; padding: 2.5rem; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
      <div style="margin-bottom: 2rem; text-align: center;">
        <h2 style="font-size: 1.875rem; font-weight: 800; color: #111827; margin: 0 0 0.5rem 0;">
          Sign in to your account
        </h2>
        <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">
          Comfort Travellers Admin Panel
        </p>
      </div>

      <!-- Plain HTML form with inline styles -->
      <div>
        <div style="margin-bottom: 1.25rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">Email</label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="Email address"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; outline: none; box-sizing: border-box; transition: border-color 0.2s;"
            :style="{ borderColor: formData.email ? '#2563eb' : '#d1d5db' }"
            :disabled="loading"
            @keyup.enter="handleLogin"
            @focus="(e) => e.target.style.borderColor = '#2563eb'"
            @blur="(e) => e.target.style.borderColor = '#d1d5db'"
          />
        </div>

        <div style="margin-bottom: 1.25rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">Password</label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="Password"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; outline: none; box-sizing: border-box; transition: border-color 0.2s;"
            :style="{ borderColor: formData.password ? '#2563eb' : '#d1d5db' }"
            :disabled="loading"
            @keyup.enter="handleLogin"
            @focus="(e) => e.target.style.borderColor = '#2563eb'"
            @blur="(e) => e.target.style.borderColor = '#d1d5db'"
          />
        </div>

        <div v-if="authStore.error" style="padding: 0.75rem; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;">
          {{ authStore.error }}
        </div>

        <button
          type="button"
          style="width: 100%; background: #2563eb; color: white; padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 1.5rem; transition: background-color 0.2s;"
          :style="{ 
            opacity: loading ? 0.6 : 1, 
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#2563eb' : '#2563eb'
          }"
          :disabled="loading"
          @click="handleLogin"
          @mouseover="(e) => { if (!loading) e.target.style.backgroundColor = '#1d4ed8' }"
          @mouseout="(e) => { if (!loading) e.target.style.backgroundColor = '#2563eb' }"
        >
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <div style="position: relative; margin: 1.5rem 0;">
          <div style="position: absolute; inset: 0; display: flex; align-items: center;">
            <div style="width: 100%; border-top: 1px solid #e5e7eb;"></div>
          </div>
          <div style="position: relative; display: flex; justify-content: center;">
            <span style="padding: 0 1rem; background: white; color: #6b7280; font-size: 0.875rem;">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          style="width: 100%; background: white; border: 1px solid #d1d5db; color: #374151; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: background-color 0.2s, border-color 0.2s;"
          :style="{ 
            opacity: loadingGoogle ? 0.6 : 1, 
            cursor: loadingGoogle ? 'not-allowed' : 'pointer'
          }"
          :disabled="loadingGoogle"
          @click="handleGoogleLogin"
          @mouseover="(e) => { if (!loadingGoogle) { e.target.style.backgroundColor = '#f9fafb'; e.target.style.borderColor = '#9ca3af'; } }"
          @mouseout="(e) => { if (!loadingGoogle) { e.target.style.backgroundColor = 'white'; e.target.style.borderColor = '#d1d5db'; } }"
        >
          <svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ loadingGoogle ? 'Signing in...' : 'Sign in with Google' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const { $firebase } = useNuxtApp()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const loadingGoogle = ref(false)

const formData = ref({
  email: '',
  password: '',
})

const handleLogin = async () => {
  if (!formData.value.email || !formData.value.password) {
    authStore.setError('Please enter both email and password')
    return
  }

  loading.value = true
  const result = await authStore.loginWithEmail(
    formData.value.email,
    formData.value.password,
    $firebase.auth,
    $firebase.firestore
  )
  loading.value = false

  if (result.success) {
    if (authStore.canAccessAdmin) {
      router.push('/')
    } else {
      authStore.setError('You do not have access to the admin panel')
      await authStore.logout($firebase.auth)
    }
  }
}

const handleGoogleLogin = async () => {
  loadingGoogle.value = true
  const result = await authStore.loginWithGoogle($firebase.auth, $firebase.firestore)
  loadingGoogle.value = false

  if (result.success) {
    if (authStore.canAccessAdmin) {
      router.push('/')
    } else {
      authStore.setError('You do not have access to the admin panel')
      await authStore.logout($firebase.auth)
    }
  }
}
</script>
