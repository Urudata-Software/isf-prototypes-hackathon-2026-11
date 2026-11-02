# isf-templates-web-app

Starting point for a client proof-of-concept that runs in a web browser. Next.js BFF
in `web/`, FastAPI in `api/`.

Anything the POC cannot do for real sits behind a seam, and a credential decides
whether the fake or the real implementation runs — including sign-in, so the app
works on a laptop with nothing configured.

**[`STACK.md`](STACK.md) is the documentation**: what this template fits, how to run
it, where things go, how seams work, what to delete before handover, and what not to
build. Its headings are a contract read by the `client-poc` skill — don't rename them.

## Create a POC from it

A GitHub template repository, so POCs are created from it rather than cloned:

```bash
gh repo create Urudata-Software/isf-prototypes-<name> \
  --template Urudata-Software/isf-templates-web-app --private --clone
```

## Run it

```bash
docker compose up
```

Open http://localhost:3000. No login, no keys, no `.env` to copy — the API container
migrates and seeds itself on start. If a port is taken, Docker fails rather than
picking another: `WEB_PORT=3100 docker compose up`.

Running natively is fully supported and is what most developers prefer —
[`STACK.md`](STACK.md) → How to run it.

