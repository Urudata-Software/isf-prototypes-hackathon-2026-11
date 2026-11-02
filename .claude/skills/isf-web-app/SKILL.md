---
name: isf-web-app
description: >
    Conventions for this POC repository — a Next.js BFF in web/ over a FastAPI backend
    in api/. Use whenever adding or changing a feature module (types, schemas, server
    functions, actions, components, pages, routers, models, migrations), adding a seam
    for something that cannot be built for real yet, extending translations, or
    answering "what's the pattern for..." about this codebase. Invoke proactively when
    someone mentions adding a feature, a screen, an endpoint, a table, or a fake.
---

# ISF web-app conventions

Two projects, one repository. `web/` is a **Backend-for-Frontend** — no database, no
business logic. `api/` owns the data. The browser talks to Next.js; Next.js talks to
`api/` server-side only.

`STACK.md` at the repo root is the authority on commands, layout and what not to
build. This skill is the file-by-file guide.

**The `documents` feature is a complete worked example** — API, module, pages, an
integration behind a seam, tests at three layers. Copy it rather than writing from
scratch, and read the real file when a reference points you at one. `STACK.md` says
how to delete it before handover.

## Where to look

| Task | Read |
|---|---|
| Add a feature end to end | **Adding a feature** below |
| An `api/` feature in detail | `references/api-feature.md` |
| Actions, forms, validation, errors | `references/actions-and-forms.md` |
| Pages, Suspense, streaming | `references/data-loading.md` |
| UI strings, translations | `references/i18n.md` |
| Fake something that cannot be real yet | `references/seams.md` |
| Components, Base UI vs Radix differences | the `shadcn` skill in `.claude/skills/shadcn/` |
| Testing it in a browser | **Testing it like a user** in `STACK.md` |

## Non-negotiable constraints

Check every file you produce against these.

**1. The browser never talks to `api/`.** `web/src/lib/api.ts` is the only backend
client and it is `server-only`. Never call it from a Client Component; never expose
`BACKEND_API_URL`.

**2. `import 'server-only'` on anything that calls the backend or reads env.** It
turns an accidental client import into a compile error instead of a leak.

**3. Always `@/` across directory boundaries.** Never `../../lib/api`.

**4. Mutations are server actions built on `actionClient`.** Never hand-roll parsing
and error handling per action — `web/src/lib/safe-action.ts` does it once. See
`references/actions-and-forms.md`.

**5. The auth boundary is `web/src/app/(protected)/layout.tsx`.** Every page under
`(protected)/` inherits it. Never add an auth check to an individual page.

**6. `params` is a Promise in Next 16.** `const { id } = await params`.

**7. Every schema crossing HTTP inherits `CamelModel`.** Plain `BaseModel` emits
`created_at`, the frontend reads `createdAt`, and the value is silently `undefined`.

**8. `id` crosses the boundary as a string.** The column is an integer; the DTO is
`string`. Keeps int and UUID keys interchangeable without touching the frontend.

**9. Never edit code to switch between a fake and the real thing.** A credential
decides — `references/seams.md`.

**10. Every on-screen string comes from `messages/`.** No literals in components, and
actions return a message *key* rather than a sentence — see `references/i18n.md`.

## Adding a feature

Work back to front: the API first, so the frontend has something real to call.

**1. `api/` — the feature.** A folder under `app/modules/`, never a global
`routers/` or `services/`. Then register it, migrate, and seed it.
`references/api-feature.md`.

**2. `web/` — the module.**

```
web/src/modules/<plural>/
  types.ts        DTOs mirroring the API response — camelCase, id: string
  schemas.ts      Zod schemas + `as const` arrays for select options
  schemas.test.ts Vitest: valid input, each rejection
  server.ts       thin api.* wrappers. starts with import 'server-only'
  actions.ts      'use server'
  components/     <entity>-table.tsx, <entity>-form.tsx, <entity>-table-skeleton.tsx
```

**3. `web/` — the pages.**

```
web/src/app/(protected)/<plural>/
  page.tsx        list, Suspense-streamed
  loading.tsx     route skeleton
  new/page.tsx    create
  [id]/page.tsx   edit — async params, bound id
  [id]/loading.tsx
  [id]/not-found.tsx
```

**4. Translations.** A namespace in every file under `web/messages/`. A missing key
throws at render time.

## Running it

`docker compose up` from the repository root needs nothing installed but Docker, and
both services hot reload. Native also works — `STACK.md`.

- **Run commands inside the container**: `docker compose exec api uv run alembic ...`,
  `docker compose exec web pnpm exec shadcn add ...`. On the host they need the
  native toolchain and write files the container may not expect.
- **A new dependency needs a rebuild**: `docker compose up --build`. Editing source
  does not.

## Checks

Six, listed in `STACK.md`. Run them after each working slice, not once at the end.
All six pass here — if one is red, you broke it.

`pnpm lint` is type-aware, so it reports deprecated APIs and unawaited promises that
`pnpm typecheck` accepts. Running only `typecheck` is not enough.

Passing checks do not mean the demo works. Drive the flow in a browser before saying
it does.
