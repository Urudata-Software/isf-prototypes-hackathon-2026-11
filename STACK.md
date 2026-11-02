# Stack: web app

## When to use this

Use this template for a POC that **people open in a web browser** and that **stores
data** — lists, forms, records, a workflow someone clicks through. This is the
default for most POCs.

It fits when the POC involves any of:

- Screens a person navigates between
- Creating, editing or deleting records that persist
- Calling an external service (an LLM, an API) behind a fake until credentials exist
- A login screen, eventually

Do **not** use it for:

- **Native mobile** apps — this runs in a browser, not on a phone's home screen
- **Standalone data analysis** — a one-off report, chart, or model with no interface
- **A command-line tool or scheduled job** with no screen at all

If a POC needs a browser interface *and* one of the above, this template plus a
developer is still the right answer.

## What's in it

Two projects in one repository. Deliberately the same stack we build production
systems with, not a lighter prototyping stack — the whole point is that a developer
continues from here.

| | |
|---|---|
| `web/` | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui (`base-nova`), next-intl (en/es), Auth.js v5, next-safe-action, Vitest |
| `api/` | FastAPI, SQLAlchemy 2 (sync), Alembic, Pydantic v2, SQLite, Ruff, pytest |
| both | Docker Compose — one container each, with hot reload |

`web/` is a **Backend-for-Frontend**: it holds no business logic and no database.
The browser talks to Next.js; Next.js talks to `api/` server-side only. `api/` owns
the data.

## How to run it

Two supported ways. **Containers are the default** — they need less installed and
there is nothing to set up. Running natively is fully supported and is what most
developers will prefer.

### Containers (recommended)

One prerequisite, plus `gh` for creating the repository:

| Needs | Check with |
|---|---|
| Docker Desktop, running | `docker compose version` |
| GitHub CLI, signed in | `gh auth status` |

Then, from the repository root:

```bash
docker compose up
```

That is the whole setup. The API container applies migrations and seeds demo data
on start, so there is no separate step and no `.env` to copy.

Open **http://localhost:3000** once the web service is ready.

**If a port is already taken**, Docker fails rather than picking another the way
`next dev` does. Override it:

```bash
WEB_PORT=3100 API_PORT=8001 docker compose up
```

Both services hot reload from the mounted source, so editing a file works exactly
as it does natively. Useful extras:

```bash
docker compose logs -f web     # follow one service
docker compose down            # stop; the SQLite file survives in api/
docker compose up --build      # after changing a dependency
```

### Natively

More to install, and a developer may prefer it — Turbopack is faster than the
webpack fallback the container uses, and there is no bind-mount indirection.

| Needs | Check with |
|---|---|
| Node 22+ | `node --version` |
| pnpm | `pnpm --version` (or `corepack enable pnpm`) |
| Python 3.12+ | `python --version` |
| uv | `uv --version` |
| GitHub CLI, signed in | `gh auth status` |

```bash
# backend
cd api
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run python -m app.seed

# frontend
cd ../web
cp .env.example .env.local
pnpm install
```

Change nothing in either `.env` file. They work as shipped.

Then two commands, in two terminals — the API first:

```bash
cd api && uv run uvicorn app.main:app --reload --port 8000
cd web && pnpm dev
```

Open **http://localhost:3000**. If 3000 is busy, Next picks another port and prints
it — use the one it prints.

### Either way

You should land on the dashboard as "Demo User" with no login prompt. If you are
asked to sign in, `ENTRA_*` values have been set that should be empty.

## Where things go

```
web/src/
  app/
    (protected)/<plural>/       pages behind the auth boundary
      page.tsx                  list, with Suspense streaming
      loading.tsx               route-level skeleton
      new/page.tsx              create
      [id]/page.tsx             edit (async params, bound id)
      [id]/not-found.tsx        404 UI
    (public)/login/page.tsx     sign-in
    api/auth/[...nextauth]/     the only route handler in the app
  components/ui/                shadcn primitives — add with `pnpm exec shadcn add <name>`
  lib/
    api.ts                      the ONLY backend client. server-only.
    env.ts                      validated environment. server-only.
    safe-action.ts              form actions: validation + one error handler
    session.ts                  the auth seam
    demo-session.ts             the fake side of the auth seam
    errors.ts  types.ts  utils.ts  auth.ts
  modules/<plural>/             one folder per feature — see the skill
messages/{en,es}.json           every UI string

compose.yaml                    both services; the default way to run
api/Dockerfile                  dev + runtime stages
web/Dockerfile                  dev + build + runtime stages

api/app/
  main.py                       app factory
  dependencies.py               FastAPI wiring — where credentials select an implementation
  seed.py
  core/                         cross-cutting infrastructure, no business logic
    config.py logging.py security.py
    exceptions.py exception_handlers.py
    schemas.py                  CamelModel — the camelCase boundary
    pagination.py               the list envelope
  database/
    base.py session.py
    migrations/versions/        Alembic
  integrations/<system>/        how to talk to an external system
    protocol.py                 the interface
    fake_client.py              the fake
    <provider>_client.py        the real one
    exceptions.py
  authorization/
    dependencies.py policies.py
  modules/<plural>/             ONE FOLDER PER FEATURE, under modules/
    router.py                   HTTP only — no queries, no business rules
    schemas.py                  Pydantic API contracts
    models.py                   SQLAlchemy persistence
    service.py                  use cases; owns transactions
    queries.py                  optional — pagination, reporting, read-heavy SQL
    prompts/                    optional — feature-owned LLM prompts

api/tests/                      sibling of app/, not inside it
  unit/                         services against fake integrations
  integration/                  queries against a real database
  api/                          the app over HTTP
```

Filenames are **kebab-case** in `web/`, **snake_case** in `api/`. Imports in `web/`
always use `@/` across directory boundaries, never `../../`.

### The rule that keeps this navigable

```
Router → feature service → database / external integrations
```

- **`router.py`** does HTTP: routes, status codes, response schemas, dependencies —
  including `dependencies=[Depends(current_caller)]`, which every feature router
  declares. No queries, no rules.
- **`service.py`** decides which rules apply, what the database does, when an
  external system is called, and what a complete transaction is. **It owns
  `commit()`** — nothing else calls it.
- **`models.py`** persists, and may hold small entity behaviour (a `publish()` that
  sets its own status). It never calls an external API or coordinates a workflow.
- **`integrations/`** knows *how* to talk to an external system. The feature service
  knows *why and when*. Business prompts therefore live in `<feature>/prompts/`, not
  in `integrations/ai/`.

Group by **feature**, not by technical layer. `documents/router.py`, not
`routers/documents.py` — global `routers/`, `services/`, `models/` folders become
unmanageable and split related code across the tree.

Not every feature needs every file. Start with `router.py`, `schemas.py`,
`models.py`, `service.py`; add `queries.py`, `tasks.py`, `prompts/` only when a
concrete need appears. **Do not create empty stubs.**

Copy `documents` for any new feature. It exists to be copied.

## Sample content

The `documents` feature is a worked example, not part of your POC. Copy from it,
then delete it — a POC that ships with it still in the menu reads as unfinished.

Delete these once your own features work:

- `web/src/modules/documents/`
- `web/src/app/(protected)/documents/`
- `api/app/modules/documents/`
- `api/tests/{api/test_documents.py,integration/test_documents_queries.py,unit/test_documents_service.py}`
- `api/app/database/migrations/versions/0001_initial.py` — then autogenerate the first migration for your own models

These still mention it afterwards, and the checks will not catch all of them:

- `api/app/main.py` — the documents router import and `include_router`
- `api/app/database/migrations/env.py` — the documents models import
- `api/app/seed.py` — replace `DOCUMENTS` with your own rows
- `web/messages/*.json` — the `documents` namespace
- `web/src/app/(protected)/dashboard/page.tsx` — the `/documents` link, a string, so typecheck stays green
- `web/src/lib/safe-action.test.ts` — uses `documents.form.*` as example keys

## Seams

The `client-poc` skill calls these **seams**. In this stack a seam is an ordinary
**port and adapters** arrangement, so nothing in the codebase is named after being
temporary and a developer finishing the POC has no structure to unwind.

| Skill's word | This stack |
|---|---|
| Seam | An **integration**: a `Protocol` plus two client implementations |
| The fake | `api/app/integrations/<system>/fake_client.py` |
| The real thing | `api/app/integrations/<system>/<provider>_client.py` |
| What decides which runs | `api/app/dependencies.py` |

**Copy the AI integration.** It is the whole pattern:

| File | Role |
|---|---|
| `api/app/integrations/ai/protocol.py` | the interface — `complete(prompt) -> str` |
| `api/app/integrations/ai/fake_client.py` | the fake |
| `api/app/integrations/ai/fake_data.py` | the fake's canned output, kept separate |
| `api/app/integrations/ai/openai_client.py` | the real one |
| `api/app/integrations/ai/exceptions.py` | what it raises when unavailable |
| `api/app/dependencies.py` | `get_ai_client()` — selects one |
| `api/app/modules/documents/prompts/summarize.py` | the **business prompt**, owned by the feature |

Three rules:

1. **A credential decides which implementation binds** — never an edited line of
   code. `if not settings.<x>_api_key: return Fake...Client()`. Consumed with
   `Depends(get_<system>_client)`.
2. **Every fake is named `fake_client.py`**, and those are the only files with that
   name. `ls api/app/integrations/*/fake_client.py` is therefore the complete list
   of what is faked in this POC — which is what the handoff document needs. Nothing
   else to maintain, and it cannot drift from reality.
3. **The integration never holds a business prompt or business rule.** It knows how
   to reach the system; the feature service knows why and when. That is what lets a
   second feature reuse the same integration.

Feature services translate an integration's exception into a `DomainError`, so the
frontend receives a readable sentence instead of a stack trace.

Finishing a seam means deleting `fake_client.py` and one `if` branch. Sometimes it
means only adding the credential and changing no code at all.

Auth is a seam too, on both sides: `web/src/lib/session.ts` and
`api/app/core/security.py`. Fill in the `ENTRA_*` variables and real sign-in takes
over — see **Turning on Entra ID** below.

## Data

SQLite, at `api/prototype.db`. No server, no setup.

```bash
cd api
uv run alembic revision --autogenerate -m "add suppliers table"   # after editing models
uv run alembic upgrade head
uv run python -m app.seed
```

Every feature's models must be imported in `app/database/migrations/env.py` or
autogenerate will not see them and will happily generate a migration that **drops**
your table.

One session per request, created by `app/database/session.py`. Transaction
boundaries belong to complete use cases, so **only feature services call
`commit()`** — never a router, a query helper, or a utility.

**Production is PostgreSQL or SQL Server.** Because migrations are in place from the
first commit and the ORM is sync SQLAlchemy (which both support), the swap is one
line in `api/.env`:

```
DATABASE_URL=postgresql+psycopg://user:password@host/dbname
DATABASE_URL=mssql+pyodbc://user:password@host/dbname?driver=ODBC+Driver+18+for+SQL+Server
```

Add the matching driver to `pyproject.toml` and re-run `alembic upgrade head`.

## Configuration and credentials

`web/.env.local` and `api/.env`, each copied from its `.env.example`. Never commit
either; both examples are committed.

`web/src/lib/env.ts` validates the frontend's variables at boot and throws on
anything invalid — a misconfiguration fails immediately and loudly rather than
halfway through a demo. Application code never reads `process.env` directly.

**Every credential is optional and its absence is a supported state.** An empty
value is the normal condition for a POC, not a broken one. Adding a required
credential breaks the "runs with no configuration" promise this template depends
on — declare it optional and bind a fake instead.

Auth is all-or-nothing: set all four of `AUTH_SECRET`, `ENTRA_TENANT_ID`,
`ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, or none. Half-configured auth fails at
boot deliberately, because the alternative is auth that looks configured and
silently is not.

### UI language

`appLocale` in `web/src/i18n/locale.ts`. Set it to the client's language, write
every string in `messages/<locale>.json`, and delete the messages file you are not
using.

A POC ships one language. It still goes through next-intl, so adding another later
is a new file, not a rewrite. Do not switch on the browser's language — a demo must
not depend on whose laptop opens it.

## Turning on Entra ID

Pre-wired. Microsoft Entra ID is the only identity provider this template targets,
the provider and token refresh are already written, and `api/` already verifies
tokens against the tenant's keys. Enabling it is configuration.

There are two levels, and **the first is usually the right one for a POC.**

### Level 1 — protect the UI. About half an hour.

The app requires sign-in; `api/` stays unauthenticated and is reachable only from
the web container.

1. **Azure Portal → App registrations → New registration.** Single tenant.
   Redirect URI, type *Web*: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   (the last segment is the provider id — do not invent one).

   Entra matches this **exactly, including the port**. If you run on a different
   one — `WEB_PORT=3100 docker compose up` — register that port's URI too, or
   sign-in fails with a `redirect_uri` mismatch. The running app will tell you
   its own value: `curl localhost:3000/api/auth/providers`.
2. **Certificates & secrets → New client secret.** Copy the *Value*, not the ID.
3. Fill in `web/.env.local` (or export them for compose):

   ```
   AUTH_SECRET=          # npx auth secret
   ENTRA_TENANT_ID=      # Directory (tenant) ID
   ENTRA_CLIENT_ID=      # Application (client) ID
   ENTRA_CLIENT_SECRET=  # the secret Value
   ```
4. Leave `ENTRA_API_SCOPE` empty, and leave `api/.env`'s `ENTRA_*` empty.
5. **Delete the `ports:` block from the `api` service in `compose.yaml`**, so the
   backend is reachable only inside the compose network. Without this the API is
   still open on `localhost:8000` and the sign-in wall is decorative.

### Level 2 — the API verifies tokens too. Half a day.

Only worth it if the POC is becoming real, or if `api/` will be exposed.

6. **App registration → Expose an API.** Set the Application ID URI (accept the
   default `api://<client-id>`) and add a scope, e.g. `access_as_user`.
7. **API permissions → Add a permission → My APIs →** your own app → that scope,
   then *Grant admin consent*.
8. Set `ENTRA_API_SCOPE=api://<client-id>/access_as_user` in `web/`, and in `api/`:

   ```
   ENTRA_TENANT_ID=      # same tenant
   ENTRA_API_AUDIENCE=   # api://<client-id>  (or the bare client id)
   ```

**Step 6 is the one that surprises people.** Without a scope of your own, Entra
issues an access token addressed to Microsoft Graph, and `api/` cannot verify a
Graph token no matter how the code is written. If token validation fails with an
audience error, this is why.

If it fails with an *issuer* error instead: Entra emits v1-format tokens for a
custom API until the app manifest sets `"accessTokenAcceptedVersion": 2`. The
template accepts both forms, so this should not bite — but that setting is the
tidier fix.

### What you get, and what you do not

Already handled: the sign-in wall on every page under `(protected)/`, the
`{tenantid}` placeholder bug in Entra's discovery document, bearer forwarding from
the BFF, signature/audience/expiry/issuer checks in `api/`, `401` (never `500`) on
a bad token, and **refresh** — `offline_access` is requested and the token is
renewed a minute before expiry, so a session outlives Entra's ~1 hour token.

Not handled: **authorization**. Every signed-in user can do everything.
`app/authorization/policies.py` is where roles or group checks go, and
`caller_from_claims` already reads Entra's `oid`, `roles` and email claims.

Also: sign-out clears this app's session, not the Microsoft one — the next sign-in
may go straight through without a prompt. Front-channel logout is a separate step.

## Checks

Six. All fast. All green in this template — if one is red, you broke it.

```bash
cd web
pnpm lint
pnpm typecheck
pnpm test

cd ../api
uv run ruff check
uv run ruff format --check
uv run pytest
```

With containers, run them inside — no local Node or Python needed:

```bash
docker compose exec web pnpm lint
docker compose exec web pnpm typecheck
docker compose exec web pnpm test

docker compose exec api ruff check
docker compose exec api ruff format --check
docker compose exec api pytest
```

Run them after each working slice, not once at the end.

`pnpm lint` is type-aware over `src/`, so it reports deprecated library APIs and
unawaited promises. Those compile fine, so `pnpm typecheck` will not flag them.

Tests are split three ways, and each layer catches something the others cannot:

| | Tests | Example |
|---|---|---|
| `tests/unit/` | services against **fake** integrations | the prompt reaches the model; an integration failure becomes a `DomainError` |
| `tests/integration/` | queries against a **real** database | pagination pages do not overlap |
| `tests/api/` | the app over **HTTP** | the contract the frontend depends on |

`tests/api/test_documents.py` is not decoration: every assertion corresponds to
something in `web/src/lib/api.ts` or `web/src/modules/documents` that breaks silently
when the shape drifts — camelCase keys, `id` as a string, the pagination envelope,
`201`/`204`/`404`/`422`, timestamps carrying a UTC offset. Keep it.

## Testing it like a user

The six checks say the code compiles and the units behave. They say nothing about
whether the demo works. Before calling a flow done, drive it in a real browser using
the `playwright-cli` skill in `.claude/skills/playwright-cli/`.

Start cold — restart the stack and load the first page fresh. The state you left
behind while building is not the state the client will see.

Then walk the path they will walk, covering:

- **The whole path, in order.** Every screen they reach, end to end, with no dead end
  and no step that only works if you already know the trick.
- **Every control does something.** Buttons, links, form submits. A control that looks
  live and does nothing is the most common way a demo falls over.
- **Data survives a reload.** Create something, refresh, reopen it from the list. A
  screen that looks right until you navigate away is not working.
- **The ways someone wanders off the path.** An empty form submitted, the back button,
  a refresh mid-flow, a deep link opened directly. Demos die here more often than on
  the happy path.
- **Nothing technical is visible.** No stack trace, no `undefined`, no placeholder
  text, no raw identifier where a label belongs.
- **The language.** Every visible string in the client's language, including the ones
  you did not write — validation messages, empty states, the 404 page.
- **The browser console.** Zero errors. Much of what breaks in a React app breaks only
  there and turns no check red.

Two quirks of this stack, so you do not misread them:

- List pages stream a skeleton first. Wait for content rather than asserting
  immediately, or you will read a loading table as an empty one.
- Dev mode always logs a React DevTools notice, an HMR line and font-preload
  warnings. Errors are what matter.

The instructions are committed at `.claude/skills/playwright-cli/`; the command
itself is not. Install it when you need it:

```bash
npm install -g @playwright/cli@latest
```

That needs Node on the host, which the container path otherwise does not — if it is
missing and cannot be installed, that is an escalation, not something to work around.

On a Windows laptop Chromium often will not launch. Pass `--browser=msedge`, which
drives the Edge already on the machine and downloads no browser.

Screenshots and console logs land in `.playwright-cli/`, which is gitignored. Leave
them there — never commit them.

## Out of scope for a POC

Do not build these. A developer decides what of it matters, and time spent here is
time not spent on the flow the client asked to see.

- **Styling** beyond the shadcn defaults. No custom themes, no brand colours.
- **Real authentication.** The seam is already there; leave it faked.
- **Error, empty and loading states** beyond the skeletons that already exist.
- **Input validation** beyond the Zod schema the form already needs.
- **Tests** beyond the schema tests and the contract tests already here.
- **Responsiveness, accessibility passes, performance work.**
- **Storybook, end-to-end tests, observability.** Deliberately not in this
  template. A developer adds them if the POC becomes real.
- **Anything on more than one happy path.** One realistic path works. That is the
  whole requirement.

Also absent on purpose: **CORS**. Every request comes from the Next.js server, never
a browser. Adding CORS would invite calling `api/` from client code, which the
architecture forbids.

### Deploying it

Out of scope for the first pass, and a developer's job — but the Dockerfiles are
ready for it. Both have a `runtime` stage with the source baked in, no reloader,
and no dev dependencies; `web` builds Next's standalone output. Build them with
`docker build --target runtime ./api` and `./web`. Nothing in `compose.yaml`
targets these — it runs the `dev` stages.
