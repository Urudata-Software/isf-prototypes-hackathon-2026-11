import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { env } from './env';

declare module '@auth/core/jwt' {
	interface JWT {
		accessToken?: string;
		refreshToken?: string;
		expiresAt?: number;
		error?: 'RefreshFailed';
	}
}

export const ENTRA_PROVIDER_ID = 'microsoft-entra-id';

const tenantId = env.ENTRA_TENANT_ID;
const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;
const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

// offline_access buys a refresh token; ENTRA_API_SCOPE addresses the access
// token to our API instead of to Microsoft Graph.
const scope = ['openid', 'profile', 'email', 'offline_access', env.ENTRA_API_SCOPE]
	.filter(Boolean)
	.join(' ');

const entra =
	tenantId && env.ENTRA_CLIENT_ID && env.ENTRA_CLIENT_SECRET
		? MicrosoftEntraID({
				id: ENTRA_PROVIDER_ID,
				clientId: env.ENTRA_CLIENT_ID,
				clientSecret: env.ENTRA_CLIENT_SECRET,
				issuer,
				authorization: { params: { scope } },
			})
		: null;

// Returns the token carrying an `error` rather than throwing, so a failed
// refresh sends the user to sign-in instead of crashing a render.
async function refreshAccessToken(token: import('@auth/core/jwt').JWT) {
	if (!token.refreshToken || !env.ENTRA_CLIENT_ID || !env.ENTRA_CLIENT_SECRET) {
		return { ...token, error: 'RefreshFailed' as const };
	}

	try {
		const response = await fetch(tokenEndpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: token.refreshToken,
				client_id: env.ENTRA_CLIENT_ID,
				client_secret: env.ENTRA_CLIENT_SECRET,
				scope,
			}),
		});

		const refreshed = await response.json();

		if (!response.ok) {
			return { ...token, error: 'RefreshFailed' as const };
		}

		return {
			...token,
			accessToken: refreshed.access_token as string,
			expiresAt: Math.floor(Date.now() / 1000) + (refreshed.expires_in as number),
			// Entra rotates it; keeping the old one breaks the next refresh.
			refreshToken: (refreshed.refresh_token as string) ?? token.refreshToken,
			error: undefined,
		};
	} catch {
		return { ...token, error: 'RefreshFailed' as const };
	}
}

export const { auth, signIn, signOut, handlers } = NextAuth({
	session: {
		strategy: 'jwt',
	},

	// Constructed even with no provider, since the route handler is always
	// compiled. With no provider no session is issued, so this signs nothing.
	secret: env.AUTH_SECRET ?? 'demo-mode-placeholder-not-a-secret',

	providers: entra ? [entra] : [],

	pages: {
		signIn: '/login',
	},

	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				return {
					...token,
					accessToken: account.access_token,
					refreshToken: account.refresh_token,
					expiresAt: account.expires_at,
				};
			}

			// A minute early: expiring mid-flight reads as a 401 at the API.
			const expiresAt = token.expiresAt ?? 0;

			if (Date.now() < expiresAt * 1000 - 60_000) {
				return token;
			}

			return refreshAccessToken(token);
		},

		authorized({ auth }) {
			return !!auth?.user;
		},
	},
});
