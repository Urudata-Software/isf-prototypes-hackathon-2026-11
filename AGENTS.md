<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Before writing anything in this repository

**Read `STACK.md`.** It is the authority on layout, commands, seams, migrations, and
what must not be built. Where it disagrees with your instincts, it wins. Where it is
silent, follow the closest pattern already here and record the choice rather than
stopping to ask.

**Use the skill at `.claude/skills/isf-web-app/`** before adding or changing a
feature. It holds the non-negotiable constraints and a file-by-file guide. Working
from memory of a similar stack is how this repo drifts.

**Copy the `documents` feature.** It is a complete worked example — API, module,
pages, an integration behind a seam, tests at three layers. Then delete it before
handover; `STACK.md` lists what to remove under **Sample content**.

This is a prototype. `STACK.md` has an **Out of scope for a POC** section, and it
means it — building beyond it is not thoroughness, it is the wrong work.

`.claude/skills/` also holds `shadcn` and `playwright-cli`, committed as plain
directories so a clone gets them. `npx skills add` would instead vendor them under
`.agents/` and symlink here, which does not survive a clone on Windows — copy the
directory in by hand and record it in `skills-lock.json`.

# Comments

Before writing one, ask: **could a reader recover this from the code anywhere in
this repo?**

- **No, it exists nowhere else** — an external system's behaviour, a deliberate
  absence, a constraint invisible from here. The only case where a comment is
  allowed.
- **It restates something the code already says.** Delete it.
- **It restates the line directly below it.** Never write this one.

Needing a comment is first a signal the code is wrong. Reach for a clearer name or a
named helper: `provided_fields(data)` in `api/app/core/schemas.py` and the
`lru_cache` on `_jwks()` in `api/app/core/security.py` both exist because the comment
they replaced was too long.

When one is warranted, one or two plain lines. Never narrate statements, never put
architecture in a comment — that is `STACK.md` — and never restate what `STACK.md`
or a skill already documents. Same bar for docstrings, which are for a name and
signature that genuinely leave something open. That is rare.

# Code style

- **Code is English.** Identifiers, filenames, commit messages, env var names. Text
  the client reads follows the demo language and lives only in `web/messages/`.
- **Filenames are kebab-case in `web/`, snake_case in `api/`.**
- **In `web/`, import across directories with `@/`**, never `../../`.
- Prefer a clear name, a small cohesive function, or a type over a comment or a
  clever line.
- Formatting is not a decision: `pnpm lint` and `ruff format` own it.

# Architecture

**`web/` is a Backend-for-Frontend.** No database, no business logic. The browser
talks to Next.js; Next.js talks to `api/`, server-side only. `web/src/lib/api.ts` is
the only backend client and it is `server-only` — never import it into a Client
Component and never expose `BACKEND_API_URL` to the browser. Anything reading env or
calling the backend starts with `import 'server-only'`.

**`api/` owns the data, and is feature-oriented.** Each feature is a folder under
`app/modules/` — `app/modules/documents/`, never a global `app/routers/`. The
dependency direction is always
`router.py → service.py → database / integrations`, and **only services call
`commit()`**. A router that runs a query, or a service that returns an HTTP
response, is wrong.

`app/integrations/` knows *how* to reach an external system; the feature service
knows *why and when*. A business prompt therefore belongs in
`app/modules/<feature>/prompts/`, not in `app/integrations/ai/`.

**Nothing is edited to switch between a fake and the real thing.** A credential
decides, in `app/dependencies.py`. See **Seams** in `STACK.md`.

# Two things agents get wrong here

**The boundary is camelCase, Python is snake_case.** Every request and response
schema inherits from `CamelModel` (`api/app/core/schemas.py`). A schema that doesn't
serialises `created_at` where the frontend reads `createdAt`, and the field silently
arrives as `undefined` — no error, no warning. Same for `id`, which crosses as a
**string** even though the column is an integer.

**Pydantic v2, not v1.** `model_dump()`, `model_validate()`, `field_serializer`,
`ConfigDict`. Not `.dict()`, `.parse_obj()`, or `class Config`.

# Before saying it works

Run the six checks listed in `STACK.md`. All six pass here; a red one is something
you just did. `pnpm lint` is type-aware, so it reports deprecated APIs and unawaited
promises that `pnpm typecheck` accepts — running only `typecheck` is not enough.

Then drive the flow in a browser with the `playwright-cli` skill, watching the
console. The checks cannot tell you whether the demo works — see **Testing it like a
user** in `STACK.md`.
