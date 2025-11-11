# Comfort Travellers Admin Panel

Admin web panel for managing routes, trips, vehicles, users, tickets, reports, and notifications.

## Tech Stack

- **Framework**: Nuxt 3 + TypeScript
- **UI**: Tailwind CSS 3 + Naive UI
- **State**: Pinia
- **Utilities**: VueUse, Zod, Day.js
- **Charts**: Apache ECharts
- **Firebase**: Auth, Firestore, Storage, Analytics
- **Testing**: Vitest + Playwright
- **Linting**: ESLint + Prettier

## Prerequisites

- Node.js 18+ 
- Yarn package manager
- Firebase project with required services enabled

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your Firebase configuration values.

4. Run development server:
```bash
yarn dev
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn generate` - Generate static site
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn format` - Format code with Prettier
- `yarn typecheck` - Run TypeScript type checking
- `yarn test` - Run unit tests
- `yarn test:e2e` - Run end-to-end tests

## Project Structure

```
├── assets/          # CSS, images, etc.
├── components/      # Vue components
├── composables/     # Vue composables
├── layouts/         # Layout components
├── middleware/      # Route middleware
├── pages/           # Application pages
├── plugins/         # Nuxt plugins
├── stores/          # Pinia stores
├── lib/             # Utilities and helpers
│   ├── repositories/  # Firestore data access layer
│   ├── validation/    # Zod schemas
│   └── utils/         # Helper functions
└── tests/           # Test files
```

## Firebase Setup

See `docs/firebase-prereqs.md` for detailed Firebase configuration requirements.

## Development Roadmap

See `docs/execution-roadmap.md` for the phased development plan.

## License

Private project

