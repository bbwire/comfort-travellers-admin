import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import type { FirebaseInjection } from '~/types/firebase'

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  const config = useRuntimeConfig().public

  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: config.firebaseApiKey,
      authDomain: config.firebaseAuthDomain,
      projectId: config.firebaseProjectId,
      appId: config.firebaseAppId,
      messagingSenderId: config.firebaseMessagingSenderId,
      storageBucket: config.firebaseStorageBucket,
      measurementId: config.firebaseMeasurementId,
    })

  const firebase: FirebaseInjection = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
    analytics: null,
  }

  return {
    provide: { firebase },
  }
})
