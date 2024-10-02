// import { error } from '@sveltejs/kit';
// import { Name, type API } from '@wharfkit/antelope';

import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// const result = await getClient(fetch).v1.chain.get_table_rows({
	// 	code: 'eosio.msig',
	// 	scope: params.proposer,
	// 	table: 'proposal',
	// 	lower_bound: Name.from(params.proposal),
	// 	upper_bound: Name.from(params.proposal),
	// 	limit: 1
	// });
	// if (!result.rows.length) {
	// 	return error(404, {
	// 		message: `Proposal ${params.proposer}/${params.proposal} not found.`
	// 	});
	// }
	// const proposal = result.rows[0];
	// return {
	// 	proposer: params.proposer,
	// 	name: params.proposal,
	// 	proposal
	// };
};
