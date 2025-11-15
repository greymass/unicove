import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		subtitle: `Choose a ${params.walletType} wallet`,
		backPath: `/${PUBLIC_CHAIN_SHORT}/signup/wallets`
	};
};
