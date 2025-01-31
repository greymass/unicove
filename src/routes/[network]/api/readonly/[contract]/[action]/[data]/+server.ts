import { json, type RequestEvent } from '@sveltejs/kit';

import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import { getBackendNetwork } from '$lib/wharf/client/ssr.js';
import { ContractKit } from '@wharfkit/contract';
import { Name, Serializer, Transaction } from '@wharfkit/antelope';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.contract || !params.action || !params.data) {
		return json({ error: 'Malformed URL.' }, { status: 500 });
	}

	const network = getBackendNetwork(chain, fetch);
	const contractKit = new ContractKit({
		client: network.client
	});
	const contract = await contractKit.load(params.contract);

	const act = contract.action(params.action, params.data);
	// Remove authorizations
	act.authorization = [];
	// Assemble readonly transaction
	const transaction = Transaction.from({
		ref_block_num: 0,
		ref_block_prefix: 0,
		expiration: 0,
		actions: [act]
	});
	// Execute and retrieve response
	const response = await contractKit.client.v1.chain.send_read_only_transaction(transaction);
	if (response.processed.except) {
		throw new Error(JSON.stringify(response.processed.except));
	}
	// Decode and return results
	const hexData = response.processed.action_traces[0].return_value_hex_data;
	const returnType = contract.abi.action_results.find((a) =>
		Name.from(a.name).equals(params.action)
	);
	if (!returnType) {
		throw new Error(`Return type for ${name} not defined in the ABI.`);
	}

	return json(
		Serializer.decode({
			data: hexData,
			type: returnType.result_type,
			abi: contract.abi
		}),
		{ status: 200 }
	);
}
