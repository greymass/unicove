import * as v from 'valibot';
import { command, getRequestEvent } from '$app/server';

export const setLocale = command(v.string(), async (locale: string) => {
	const request = getRequestEvent();
	request.cookies.set('locale', locale, {
		path: '/',
		httpOnly: false, // Allow client-side access
		secure: request.url.protocol === 'https:',
		sameSite: 'lax' // Changed from 'strict' to 'lax' for better cross-navigation support
	});
	return { saved: true };
});
