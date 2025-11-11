// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-01-01',
  devtools: { enabled: true },
  
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMeasurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    // Private runtime config (server-side only)
    sentryDsn: process.env.SENTRY_DSN,
    analyticsToggle: process.env.ANALYTICS_TOGGLE || 'true',
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  vite: {
    // Vite configuration
  },

  // Ensure Naive UI styles are imported
  build: {
    transpile: ['naive-ui'],
  },

  app: {
    head: {
      title: 'Comfort Travellers Admin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Admin panel for Comfort Travellers' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})

