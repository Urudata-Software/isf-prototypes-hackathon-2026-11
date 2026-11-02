import type { Session } from 'next-auth';

// .invalid is reserved by RFC 2606, so this can never be a real account.
export const DEMO_SESSION: Session = {
	user: {
		name: 'Demo User',
		email: 'demo@prototype.invalid',
	},
	expires: '2099-12-31T23:59:59.000Z',
};
