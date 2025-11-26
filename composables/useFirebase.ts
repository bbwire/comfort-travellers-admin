import type { FirebaseInjection } from '~/types/firebase'

export const useFirebase = (): FirebaseInjection => {
  const { $firebase } = useNuxtApp()
  return $firebase
}

