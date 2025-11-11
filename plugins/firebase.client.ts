import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getAnalytics, type Analytics } from 'firebase/analytics'

export default defineNuxtPlugin({
  name: 'firebase',
  setup() {
    const config = useRuntimeConfig()

    // Initialize Firebase only on client side
    let app: FirebaseApp
    let auth: Auth
    let firestore: Firestore
    let storage: FirebaseStorage
    let analytics: Analytics | null = null

    if (!getApps().length) {
      const firebaseConfig = {
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        projectId: config.public.firebaseProjectId,
        appId: config.public.firebaseAppId,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        storageBucket: config.public.firebaseStorageBucket,
        measurementId: config.public.firebaseMeasurementId,
      }

      app = initializeApp(firebaseConfig)
      auth = getAuth(app)
      firestore = getFirestore(app)
      storage = getStorage(app)

      // Analytics only in browser
      if (process.client && config.public.firebaseMeasurementId) {
        analytics = getAnalytics(app)
      }
    } else {
      app = getApps()[0]
      auth = getAuth(app)
      firestore = getFirestore(app)
      storage = getStorage(app)
      if (process.client && config.public.firebaseMeasurementId) {
        analytics = getAnalytics(app)
      }
    }

    return {
      provide: {
        firebase: {
          app,
          auth,
          firestore,
          storage,
          analytics,
        },
      },
    }
  },
})
