import 'server-only';
import { z } from 'zod';

const schema = z
  .object({
    BACKEND_API_URL: z.url('BACKEND_API_URL must be a valid URL'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Unset: demo user. Set: Entra takes over. No code change either way.
    AUTH_SECRET: z.string().min(1).optional(),
    ENTRA_TENANT_ID: z.string().min(1).optional(),
    ENTRA_CLIENT_ID: z.string().min(1).optional(),
    ENTRA_CLIENT_SECRET: z.string().min(1).optional(),

    // Optional even with auth on; without it api/ must stay unauthenticated.
    ENTRA_API_SCOPE: z.string().min(1).optional(),
  })
  .refine(
    (value) => {
      const parts = [
        value.AUTH_SECRET,
        value.ENTRA_TENANT_ID,
        value.ENTRA_CLIENT_ID,
        value.ENTRA_CLIENT_SECRET,
      ];
      return parts.every((part) => part === undefined) || parts.every((part) => part !== undefined);
    },
    {
      message:
        'Auth is half-configured. Set all of AUTH_SECRET, ENTRA_TENANT_ID, ENTRA_CLIENT_ID and ENTRA_CLIENT_SECRET, or none of them.',
    },
  );

// An empty value in .env arrives as '' not undefined, and `ENTRA_TENANT_ID=`
// must not read as auth being on.
const present = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ''));

const parsed = schema.safeParse(present);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment variables — check your .env file');
}

export const env = parsed.data;
