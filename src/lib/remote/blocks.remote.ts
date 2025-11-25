import { query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { type API } from '@wharfkit/antelope';

export const getBlocks = query(async () => {
	const event = getRequestEvent();
	const { locals } = event;
	const { network } = locals;

	try {
		// Get the current chain info to find the latest block number
		const info = await network.client.v1.chain.get_info();
		const latestBlockNum = Number(info.head_block_num);

		// Get the latest 5 blocks
		const blockPromises = [];
		for (let i = 0; i < 5; i++) {
			const blockNum = latestBlockNum - i;
			if (blockNum >= 1) {
				blockPromises.push(
					network.client.call({
						method: 'POST',
						path: '/v1/chain/get_block',
						params: {
							block_num_or_id: blockNum
						}
					}) as Promise<API.v1.GetBlockResponse>
				);
			}
		}

		const blocks = await Promise.all(blockPromises);

		return blocks;
	} catch (error) {
		console.error('Error fetching blocks:', error);
		return [];
	}
});
