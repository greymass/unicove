import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { walletTypes } from './walletTypes';

export const load: PageLoad = async ({ params }) => {
	const firstWalletType = Object.keys(walletTypes)[0];
	throw redirect(302, `/${params.network}/signup/${firstWalletType}`);
};
