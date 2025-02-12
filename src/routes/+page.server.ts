import { redirect } from '@sveltejs/kit';
import { PUBLIC_DEFAULT_CHAIN } from '$env/static/public';

export function load() {
	return redirect(301, `/${PUBLIC_DEFAULT_CHAIN}`);
}
