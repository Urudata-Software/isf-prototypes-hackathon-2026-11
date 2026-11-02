# Seams

When the POC cannot do something for real — no API key, no access to a client
system, an integration nobody has built — it gets a seam. Never a hardcoded value
inline.

A seam here is an **integration**, so nothing is named after being temporary. A
developer finishing the POC deletes a file and one branch; no directory has to be
unwound.

```
api/app/integrations/<system>/protocol.py            the interface
api/app/integrations/<system>/fake_client.py         the fake
api/app/integrations/<system>/fake_data.py           the fake's canned output
api/app/integrations/<system>/<provider>_client.py   the real one
api/app/integrations/<system>/exceptions.py          what it raises when unavailable
api/app/dependencies.py                              get_<system>_client() — selects one
```

Copy the `ai` integration.

## The selection rule

The only rule that really matters: a credential decides, never an edit.

```python
def get_ai_client() -> AiClient:
    if not settings.openai_api_key:
        return FakeAiClient()

    return OpenAiClient(settings.openai_api_key)
```

Consumed with `Depends(get_ai_client)`.

## Rules

- **Credentials are optional in `core/config.py`, always.** `str | None = None`. An
  empty value is the normal state for a POC. Making one required breaks this
  template's promise that it runs with nothing configured.
- **The fake is always `fake_client.py`** — the only file with that name.
  `ls api/app/integrations/*/fake_client.py` is the complete inventory of what this
  POC fakes, which is exactly what the handoff document needs. It cannot drift,
  because it is the code.
- **Fakes return realistic output.** `foo`/`bar`/`Test 1` cannot be shown to a
  client, and nobody notices until the meeting. Use plausible names, amounts and
  dates, in the client's own terminology and language.
- **The integration holds no business logic.** It knows *how* to reach the system;
  the feature service knows *why and when*. So a prompt lives in
  `app/modules/<feature>/prompts/`, never in `integrations/ai/` — that is what lets a
  second feature reuse the same integration.
- **The feature service translates the integration's exception into a `DomainError`,**
  so the router stays free of integration concerns and the frontend gets a readable
  sentence.
- **Name the interface after the system, the client after the provider.**
  `AiClient` in `protocol.py`; `OpenAiClient` in `openai_client.py`.
