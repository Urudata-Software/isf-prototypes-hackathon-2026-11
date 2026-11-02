# Building an `api/` feature

Copy `api/app/modules/documents/`. This is what to know while doing it.

## Files

```
api/app/modules/<plural>/
  router.py       HTTP only: routes, status codes, schemas, dependencies
  schemas.py      CamelModel request/response contracts
  models.py       SQLAlchemy persistence (+ small entity behaviour)
  service.py      use cases; owns commit()
  queries.py      optional — pagination, reporting, read-heavy SQL
  prompts/        optional — feature-owned LLM prompts
```

Start with the first four. Add the rest when a concrete need appears, **never as an
empty stub**.

The dependency direction never bends: `router.py → service.py → database /
integrations`. A router that runs a query, or a service that returns an HTTP
response, is wrong. Only services commit.

## Auth is per-router

Every feature router declares the dependency. It is not applied app-wide, because
that would also gate `/health` and break the container healthcheck the moment Entra
is configured.

```python
router = APIRouter(
    prefix="/<plural>",
    tags=["<plural>"],
    dependencies=[Depends(current_caller)],
)
```

## Wiring it up

- Register the router in `api/app/main.py`.
- **Import the models in `api/app/database/migrations/env.py`.** Autogenerate cannot
  see a model it has not imported, and will cheerfully write a migration that
  **drops** your table.
- `uv run alembic revision --autogenerate -m "..."`, then `uv run alembic upgrade head`.
- Add rows to `api/app/seed.py`, including **one awkward case** — a record that does
  not fit. What happens to that one is usually the point of the demo, and a seed
  where every row is tidy hides it.

## The endpoint contract

The frontend's api client depends on all of this.

| Verb | Path | Returns |
|---|---|---|
| `GET` | `/<plural>?page=1&pageSize=20` | `PaginatedResult[T]` |
| `GET` | `/<plural>/{id}` | the entity |
| `POST` | `/<plural>` | **201** + the entity |
| `PATCH` | `/<plural>/{id}` | the entity (partial update) |
| `DELETE` | `/<plural>/{id}` | **204**, empty body |

`PATCH`, not `PUT`. The query parameter is `pageSize`, not `page_size` — use
`Depends(page_params)`.

Return `404` and `401` only when you mean them: the frontend turns `404` into the
not-found page and `401` into a redirect to `/login`.

## Timestamps

SQLite stores no timezone, so a `datetime` written as UTC reads back naive. Emitted
without an offset, the browser's `new Date()` reads it as local time and every date
the client sees shifts. Every timestamp schema needs the `field_serializer` that
`DocumentRead` has. There is a test for it; keep it.

## Tests

Three layers under `api/tests/`, each catching what the others cannot.

| Directory | Tests | With |
|---|---|---|
| `unit/` | feature services | **fake** integrations — see `RecordingAi` in `test_documents_service.py` |
| `integration/` | queries, provider serialisation | a **real** SQLite database |
| `api/` | the whole app over HTTP | `TestClient` + `dependency_overrides` |

Shared fixtures (`db`, `client`) are in `tests/conftest.py`.

A new feature needs at least an `api/` test for the contract. Add a `unit/` test when
the service makes a decision worth pinning, and an `integration/` test when it has
non-trivial SQL.
