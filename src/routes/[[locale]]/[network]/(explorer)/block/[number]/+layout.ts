import type { LayoutLoad } from './$types';
import { API, TimePoint } from '@wharfkit/antelope';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/en/${network}/api/block/${params.number}`);
	const json = await response.json();
	const block = json.block as API.v1.GetBlockResponse;

	const { cpuCount, netCount, actionCount } = block.transactions.reduce(
		(acc, tx) => {
			acc.cpuCount += Number(tx.cpu_usage_us);
			acc.netCount += Number(tx.net_usage_words) * 8;
			acc.actionCount += tx.trx.transaction ? tx.trx.transaction.actions.length : 0;
			return acc;
		},
		{ cpuCount: 0, netCount: 0, actionCount: 0 }
	);

	const details = {
		totalCpu: cpuCount,
		totalNet: netCount,
		totalActions: actionCount,
		blockId: String(block.id),
		blockNumber: Number(block.block_num),
		blockProducer: block.producer
	};

	const date = TimePoint.from(block.timestamp).toDate();

	const description = `Block #${params.number} was produced by ${block.producer} on ${date}, which included ${block.transactions.length} transactions performing ${actionCount} actions.`;

	const title = `Block #${params.number}`;

	return {
		number: params.number,
		title,
		subtitle: date.toISOString(),
		header: {
			copyData: params.number
		},
		block,
		details,
		network: PUBLIC_CHAIN_SHORT,
		height: Number(params.number),
		pageMetaTags: {
			title: `${title} | ${network.chain.name} Network`,
			description
		}
	};
};
