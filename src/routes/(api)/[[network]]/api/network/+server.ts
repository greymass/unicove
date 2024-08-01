import { getWharf, WharfService } from '$lib/wharf/service.svelte';
import { json } from '@sveltejs/kit';

export async function GET({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': 'max-age=3600' // 3600 seconds, replace with your preferred length.
	});
	const wharf = getWharf(fetch);
	const [ramstate, rexstate, tokenstate] = await Promise.all([
		wharf.resources.v1.ram.get_state(),
		wharf.resources.v1.rex.get_state(),
		getTokenPrice(wharf)
	]);
	return json({
		ts: new Date(),
		ramstate,
		rexstate,
		tokenstate
	});
}

async function getTokenPrice(service: WharfService) {
	const { delphioracle } = service.contracts;
	if (delphioracle) {
		const response = await delphioracle.table('datapoints', 'eosusd').get();
		return response;
	}
	return undefined;
}
