import { redirect } from '@sveltejs/kit';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';

export function load() {
	return redirect(301, `/${PUBLIC_CHAIN_SHORT}`);
}
