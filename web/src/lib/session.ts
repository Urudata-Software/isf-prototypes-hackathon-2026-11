import 'server-only';
import { auth } from './auth';
import { DEMO_SESSION } from './demo-session';
import { env } from './env';

export const authEnabled = Boolean(env.ENTRA_TENANT_ID);

export async function getSession() {
	if (!authEnabled) return DEMO_SESSION;

	return auth();
}
