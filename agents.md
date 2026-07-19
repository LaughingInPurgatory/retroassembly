# Agent Instructions

## Overview

Browser-based retro gaming platform with dual-runtime architecture (Node.js + Cloudflare Workers).

**This repository is the fork `LaughingInPurgatory/retroassembly`.** Work only against remote `origin`. Do **not** push, tag, open PRs, or release on `upstream` (`arianrhodsandlot/retroassembly`) unless the user explicitly asks.

**Tech Stack**: React, React Router, Radix Themes, Tailwind CSS, SWR, i18next | Hono, Drizzle, Argon2

## Remotes

- `origin` → `https://github.com/LaughingInPurgatory/retroassembly.git` (fetch + push)
- `upstream` → `https://github.com/arianrhodsandlot/retroassembly.git` (fetch only)

Container images: `ghcr.io/laughinginpurgatory/retroassembly` (tag push → workflow `Build and Push Docker Image`).

## Key Directories

- `src/databases/schema.ts` — Drizzle ORM schema
- `src/controllers/` — Business logic
- `src/api/routes/` — Hono API routes with `@hono/zod-validator`
- `src/api/client.ts` — Type-safe client (Hono `hc`)
- `src/pages/routes.ts` — React Router config
- `src/middlewares/` — Request context (currentUser, db)
- `src/constants/platform.ts` — Platform catalog (cores, BIOS, extensions)
- `src/constants/core.ts` / `src/constants/core-options/` — Core metadata and options
- `src/pages/library/utils/nostalgist.ts` — Core loading / Nostalgist configure
- `public/cores/` — Self-shipped WASM cores (zip: js + wasm)

## Local WASM cores (`public/cores/`)

Loaded via `/cores/<name>_libretro.zip?v=<build>` (cache-bust). Currently:

| Core            | Platform     |
| --------------- | ------------ |
| `virtualjaguar` | Atari Jaguar |
| `fuse`          | ZX Spectrum  |
| `cap32`         | Amstrad CPC  |

Other cores come from the shared retroarch-emscripten CDN (or custom npm pack for a few).

## Keyboard computer cores

These cores need host keyboard passthrough (typing / F-keys). `use-emulator.ts` enables RetroArch Game Focus and clears keyboard→joypad/hotkey binds:

- VICE: `vice_x64`, `vice_x64sc`, `vice_xscpu64`, `vice_x128`, `vice_xvic`, `vice_xplus4`, `vice_xpet`
- `fuse`, `cap32`

Escape still opens the in-game overlay. Gamepad button maps are unchanged.

## Commands

**Development**: `pnpm dev` (port 8000). Typically the server is already running; check whether port 8000 is in use before starting another instance.

**Build**: `pnpm build`

**Lint**: `pnpm vp check --fix`. _DO NOT_ ignore warnings; treat them as errors.

**Type check**: Included in linting. _DO NOT_ run `pnpm tsc`.

**E2E Testing** (Playwright):

- Run all: `pnpm test`
- Run single file: `pnpm test tests/e2e/account.test.ts`
- Run by name: `pnpm test -- --grep "log in"`
- Dev mode with UI: `pnpm dev:test -- --headed --ui`

**Database migrations** (Drizzle):

- Generate: `drizzle-kit generate`
- Apply (Node): Runs automatically on serve
- Apply (Workers): `wrangler d1 migrations apply retroassembly_library`

**Release (fork only)**:

1. Commit + `git push origin <branch>`
2. Tag `v7.yymmdd.HHMM` (UTC), `git push origin <tag>`
3. Docker workflow publishes `ghcr.io/laughinginpurgatory/retroassembly:<tag>` and `:latest`
4. Optional: `gh release create` on `LaughingInPurgatory/retroassembly`

## Code Style

**General**: Single quotes, no semicolons, 2-space indentation. File names: lower_snake_case (except `Dockerfile`). Redundant comments are forbidden.

**JavaScript/TypeScript**:

- Use function declarations (`function xx() {}`) over arrow functions
- Modern ECMAScript features preferred
- Complex transforms: `es-toolkit` helpers. Simple cases: `for of`, `.map`, `.flatMap`
- **Never use** `.reduce`, `.then`, `.catch`. Use `async/await` + `attemptAsync` from `es-toolkit`
- Error handling: Throw `HTTPException` from `hono/http-exception` for API errors
- Use luxon for date/time parsing/formatting
- Do not use type casting to suppress type errors. Prefer `@ts-expect-error` with reasonable comments instead.

**React**:

- Prefer named exports. One component per file.
- `useEffect`: Only when necessary (follow React's "You Might Not Need an Effect")
- Use `clsx` for className manipulation (`import { clsx } from 'clsx'`)
- State: Jotai atoms for local state (create `atom.ts` closest to usage)
- Cleanup: `AbortController` for event listeners
- i18n: `useTranslation` or `Trans` from `react-i18next`

**Error handling**:

- Controllers: Throw `HTTPException` with status code and message
- Frontend: SWR `onError` or try/catch

## Architecture Patterns

**Database schema**:

- Base fields: `id` (nanoid), `createdAt`, `updatedAt`, `status`
- Soft delete: Filter by `eq(table.status, statusEnum.normal)` for active records
- Delete: `update(table).set({ status: statusEnum.deleted })`

**API client** (`src/api/client.ts`):

```ts
import { client, parseResponse } from '#@/api/client.ts'
const data = await parseResponse(client.users.$get())
```

**Controllers**:

```ts
export async function myController() {
  const c = getContext()
  const { db } = c.var
  // Business logic
  return result
}
```

**Runtime detection**:

```ts
import { getRuntimeKey } from 'hono/adapter'
const isWorkers = getRuntimeKey() === 'workerd'
```

**i18n** (12 languages: en, de, es, fr, it, ja, ko, pt, ru, cs, zh-cn, zh-tw):
Add key to all locale files in `src/locales/`, use `t('key')` in components.

**ROM storage (fork)**: Shared `roms/<platform>/<filename>` (not per-user hash paths). Super user (first account) only for upload/scan; optional shared-library accounts are read-only for ROMs.

**BIOS storage (fork)**: Shared `bioses/<platform>/<original-filename>` (not content-hash names). `getPreference` merges any on-disk files whose names match the platform's expected BIOS list (case-insensitive).

## Key Files

- `src/constants/env.ts` — Runtime environment detection
- `src/constants/platform.ts` — Platforms
- `src/databases/schema.ts` — Database schema
- `src/api/client.ts` — Type-safe API client
- `src/api/app.ts` — Main API app, route registration
- `src/middlewares/globals.ts` — Request context setup
- `src/pages/library/utils/nostalgist.ts` — Emulator core resolution
- `src/pages/library/components/emulator-portal/hooks/use-emulator.ts` — Launch / RA config
- `vite.config.ts` — Dual-runtime build configuration
- `readme.md` — User-facing docs for this fork
