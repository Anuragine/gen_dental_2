# Project Stack & Tools

## Core Platform & Languages
- Node.js (server runtime, build tools, Netlify functions)
- TypeScript (client, server, shared)
- HTML (index.html)
- CSS via TailwindCSS utility classes

## Package Manager & Build
- pnpm (primary package manager)
- Vite (dev server + React bundler)
- @vitejs/plugin-react-swc (SWC-based React/TS compilation)
- tsx (running TypeScript scripts like seed.ts)
- PostCSS
- Autoprefixer

## Frontend (SPA)
- React 18
- React DOM
- React Router DOM (SPA routing)
- TailwindCSS 3 (styling)
- tailwind-merge (class merging)
- clsx (conditional classNames)
- Shadcn / Radix-based UI kit (components under client/components/ui)
- lucide-react (icons)
- react-hook-form
- @hookform/resolvers
- @tanstack/react-query (data fetching & caching)
- date-fns (date formatting)
- framer-motion (animations)
- recharts (charts)
- react-day-picker (date picker)
- sonner (toast notifications)
- react-resizable-panels
- next-themes (theme management helper)
- three
- @react-three/fiber
- @react-three/drei
- vaul (drawer/sheet components)

## Backend (API Server)
- Express 5 (REST API)
- cors
- dotenv (environment variables)
- serverless-http (Express as a Netlify Function handler)
- swagger-jsdoc (OpenAPI spec generation)
- swagger-ui-express (Swagger UI)

## Database & Authentication
- MongoDB (external service, e.g. MongoDB Atlas)
- Mongoose (ODM: models for User, Appointment, ChatHistory)
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- uuid (ID generation where needed)

## Validation & Shared Types
- Zod (schema validation and types)
- Shared types module in shared/api.ts

## Testing & Code Quality
- Vitest (testing)
- Prettier (code formatting)
- TypeScript compiler (tsc for type checking)
- globals (test/env typings)

## Deployment & Hosting
- Netlify (static hosting + serverless functions)
- Netlify Functions (netlify/functions, main api.ts)
- netlify.toml (build command, publish dir, redirects)
- Suggested external services:
  - MongoDB Atlas (database)
  - OpenAI API (chatbot, via openai package)

## Configuration & Structure
- Tailwind config: tailwind.config.ts
- TypeScript config: tsconfig.json
- Vite configs: vite.config.ts, vite.config.server.ts
- Express server entry: server/index.ts
- Shared types: shared/api.ts
- Client app entry & routing: client/App.tsx
- Global styles: client/global.css
