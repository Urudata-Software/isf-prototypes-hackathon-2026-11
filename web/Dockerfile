# syntax=docker/dockerfile:1

# Debian rather than Alpine: Next pulls in native binaries (sharp, @swc/core)
# that need glibc, and the musl workarounds are a recurring source of
# "works on my machine".
FROM node:22-slim AS base

RUN corepack enable

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app


FROM base AS deps

# .npmrc carries strict-peer-dependencies=false and pnpm-workspace.yaml carries
# the approved native builds; without both, install fails or stops for approval.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile


# What compose runs. node_modules comes from the image; source arrives via the
# bind mount, with an anonymous volume keeping this directory from being hidden.
FROM deps AS dev

CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]


FROM deps AS build

COPY . .
# BACKEND_API_URL is validated at import time by src/lib/env.ts, and `next build`
# imports server modules while prerendering. A syntactically valid placeholder
# gets the build through; the real value is supplied at run time.
ENV BACKEND_API_URL=http://api:8000
RUN pnpm build


# For a developer deploying the POC. Needs `output: 'standalone'` in
# next.config.ts, which is what produces .next/standalone.
FROM base AS runtime

ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
