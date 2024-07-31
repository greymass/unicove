import { wharf } from '$lib/wharf/service.svelte';
import { json } from '@sveltejs/kit';
import { Resources } from '@wharfkit/resources';

const resources = new Resources({
	api: wharf.client,
	sampleAccount: 'eosio.reserv'
});

export async function GET({ setHeaders }) {
	setHeaders({
		'cache-control': 'max-age=3600' // 3600 seconds, replace with your preferred length.
	});
	const [ramstate, rexstate, tokenstate] = await Promise.all([
		resources.v1.ram.get_state(),
		resources.v1.rex.get_state(),
		getTokenPrice()
	]);
	return json({
		ts: new Date(),
		ramstate,
		rexstate,
		tokenstate
	});
}

async function getTokenPrice() {
	const { delphioracle } = wharf.contracts;
	if (delphioracle) {
		const response = await delphioracle.table('datapoints', 'eosusd').get();
		console.log(response);
		return response;
	}
	return undefined;
}
