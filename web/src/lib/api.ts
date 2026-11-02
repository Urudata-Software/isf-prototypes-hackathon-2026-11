import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { env } from './env';
import { headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { ApiError } from './errors';

export { ApiError } from './errors';

type RequestOptions = Omit<RequestInit, 'body'> & {
	body?: unknown;
};

async function getAccessToken(): Promise<string | null> {
	// No secret means no session to read a token from, and getToken would throw.
	if (!env.AUTH_SECRET) return null;

	const token = await getToken({
		req: {
			headers: await headers(),
		},
		secret: env.AUTH_SECRET,
	});

	return token?.accessToken ?? null;
}

async function errorMessage(response: Response): Promise<string> {
	const body = await response.text().catch(() => '');

	if (!body) return response.statusText;

	// FastAPI reports errors as {"detail": ...}; unwrapped it reaches the UI raw.
	try {
		const parsed: unknown = JSON.parse(body);

		if (parsed && typeof parsed === 'object' && 'detail' in parsed) {
			const { detail } = parsed as { detail: unknown };

			return typeof detail === 'string' ? detail : JSON.stringify(detail);
		}
	} catch {
		// not JSON
	}

	return body;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const token = await getAccessToken();

	const { body, headers, ...rest } = options;

	const response = await fetch(`${env.BACKEND_API_URL}${path}`, {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...headers,
		},
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});

	if (!response.ok) {
		if (response.status === 401) redirect('/login');
		if (response.status === 404) notFound();

		throw new ApiError(response.status, await errorMessage(response));
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

export const api = {
	get: <T>(path: string, init?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...init, method: 'GET' }),

	post: <T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...init, method: 'POST', body }),

	put: <T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...init, method: 'PUT', body }),

	patch: <T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...init, method: 'PATCH', body }),

	delete: <T>(path: string, init?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...init, method: 'DELETE' }),
};

