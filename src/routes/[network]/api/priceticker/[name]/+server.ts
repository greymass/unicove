import { json } from '@sveltejs/kit';
import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';

export async function GET({ params }) {
    const chain = getChainDefinitionFromParams(params.network);
    if (!chain) {
        return json({ error: 'Invalid chain specified' }, { status: 400 });
    }

    const network = getNetwork(chain, fetch);
    if (!network.resources) {
        return json({ error: 'Network resources not initialized' }, { status: 500 });
    }
    if (!network.contracts.delphioracle) {
        return json({ error: 'Network not support delphioracle' }, { status: 500 });
    }
    const tokenstate = await network.contracts.delphioracle.table('datapoints', params.name).get()
    if (!tokenstate) {
        return json({ error: `Not found ${params.name}` }, { status: 500 });
    }
    return json(
        {
            ts: new Date(),
            tokenstate
        },
        {
            headers: getCacheHeaders(5)
        }
    );
}