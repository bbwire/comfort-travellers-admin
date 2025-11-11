import { onAuthStateChanged, type User } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['firebase'],
  async setup() {
    const { $firebase } = useNuxtApp()
    const authStore = useAuthStore()

    if (process.client) {
      // Set initial loading state
      authStore.setLoading(true)

      // Listen to auth state changes
      onAuthStateChanged($firebase.auth, async (user: User | null) => {
        authStore.setUser(user)
        authStore.setLoading(false)

        if (user) {
          // Fetch user profile from Firestore
          await authStore.fetchUserProfile(user.uid, $firebase.firestore)
        } else {
          authStore.setProfile(null)
        }
      })
    } else {
      // On server, just set loading to false
      authStore.setLoading(false)
    }
  },
})

