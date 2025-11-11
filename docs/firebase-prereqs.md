# Firebase Prerequisites and Setup Checklist

## Inputs required from stakeholder
- Project
  - Firebase Project ID
  - Default GCP region for Firestore/Storage (e.g., nam5/us-central1)
  - Billing plan (Blaze recommended)
- Web App
  - Public config: apiKey, authDomain, projectId, appId, messagingSenderId, storageBucket, measurementId (optional)
  - Authorized domains include admin app URL(s)
- Authentication
  - Enabled providers: Email/Password, Google
  - OAuth consent screen configured for Google sign-in
  - MFA requirement for admin accounts (recommended)
- Firestore
  - Firestore mode: Native
  - Location confirmed
  - Permission to create required composite indexes
  - Approval for initial security rules (provided in repo)
- Storage
  - Storage bucket location confirmed
  - Approval for initial storage rules (provided in repo)
- Analytics (optional)
  - Measurement ID if enabled
- Cloud Messaging (Phase 2)
  - FCM enabled and VAPID key configured for web push
- Hosting
  - Hosting site connected to the project
  - Deploy permissions for service account or CLI token
- CI/CD
  - GitHub repository access
  - Secrets to add: FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_TOKEN
  - Environment variables: NUXT_PUBLIC_* values

## Environment variables
- Required (.env / GitHub Secrets)
  - NUXT_PUBLIC_FIREBASE_API_KEY
  - NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NUXT_PUBLIC_FIREBASE_PROJECT_ID
  - NUXT_PUBLIC_FIREBASE_APP_ID
  - NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)
- Non-public (optional)
  - SENTRY_DSN
  - FEATURE_FLAGS / ANALYTICS_TOGGLE

## Hosting for static Nuxt build
- Build command
  - `yarn generate` → outputs `.output/public`
- firebase.json (SPA rewrite example)
```json
{
  "hosting": {
    "public": ".output/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```
- Deployment
  - Manual: `firebase deploy --only hosting`
  - Preview (optional): `firebase hosting:channel:deploy preview-<branch>`

## Access and roles
- Provide one of:
  - Service account JSON with Hosting + Viewer permissions (for CI)
  - Or a Firebase CI token generated via `firebase login:ci`
- Confirm we have permission to create indexes and update rules

## Approvals
- Firestore rules draft
- Storage rules draft
- Indexes creation
- Branding: logo, colors, typography
- Dashboard KPIs and navigation

## Optional Phase 2 (not required for MVP)
- Cloud Functions for scheduled reports, notifications, and cross-document invariants
- Remote Config for feature flags


