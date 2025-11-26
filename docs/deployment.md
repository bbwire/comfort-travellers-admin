# Deployment Guide

## Firebase Hosting Deployment

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in to Firebase: `firebase login`
- Firebase project initialized: `firebase init`

### Build and Deploy Process

1. **Clean Build (Recommended)**
   ```bash
   yarn generate
   ```
   This command automatically cleans all cache directories (`.output`, `.nuxt`, `.nitro`, `.cache`, `dist`) before generating the static site.

2. **Fast Build (Skip Clean)**
   If you're sure your cache is clean, you can use:
   ```bash
   yarn generate:fast
   ```

3. **Manual Clean**
   If you need to clean manually:
   ```bash
   yarn clean
   ```

4. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

### Troubleshooting

#### Old Version Being Deployed

If you're seeing old versions after deployment:

1. **Clear all caches:**
   ```bash
   yarn clean
   yarn generate
   ```

2. **Verify the generated files:**
   Check `.output/public` to ensure your latest changes are present.

3. **Clear Firebase cache (if needed):**
   ```bash
   firebase deploy --only hosting --force
   ```

4. **Check Firebase Hosting cache:**
   - Firebase Hosting may cache files. Try a hard refresh (Ctrl+Shift+R) or clear browser cache.
   - Check Firebase Console > Hosting > Files to verify the deployed files.

#### Build Cache Issues

If you suspect build cache issues:

1. Delete all cache directories:
   ```bash
   yarn clean
   ```

2. Clear node_modules cache (if needed):
   ```bash
   rm -rf node_modules/.vite
   yarn install
   ```

3. Generate fresh build:
   ```bash
   yarn generate
   ```

### Build Output

The static site is generated in `.output/public/` which is configured in `firebase.json` as the hosting public directory.

### Environment Variables

Make sure your `.env` file has all required Firebase configuration variables:
- `NUXT_PUBLIC_FIREBASE_API_KEY`
- `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NUXT_PUBLIC_FIREBASE_APP_ID`
- `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

These are baked into the build at generation time, so make sure they're correct before running `yarn generate`.

