import { onAuthStateChanged, type User } from 'firebase/auth'

export default defineNuxtPlugin(() => {
  if (!process.client) return

  const { $firebase } = useNuxtApp()
  const authStore = useAuthStore()

  if (!$firebase) {
    console.error('Firebase plugin did not load')
    return
  }

  authStore.setLoading(true)

  onAuthStateChanged($firebase.auth, async (user: User | null) => {
    authStore.setUser(user)
    authStore.setLoading(false)

    if (user) {
      await authStore.fetchUserProfile(user.uid, $firebase.firestore)
    } else {
      authStore.setProfile(null)
    }
  })
})
