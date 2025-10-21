import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const walletInfo: Record<string, { name: string; wharfPluginId: string }> = {
		anchor: { name: 'Anchor', wharfPluginId: 'anchor' },
		metamask: { name: 'MetaMask', wharfPluginId: 'wallet-plugin-metamask' },
		tokenpocket: { name: 'TokenPocket', wharfPluginId: 'wallet-plugin-tokenpocket' },
		wombat: { name: 'Wombat', wharfPluginId: 'wombat' }
	};

	const wallet = params.wallet as keyof typeof walletInfo;

	const currentWallet = walletInfo[wallet] || walletInfo.anchor;

	return {
		title: `Welcome to ${currentWallet.name}`,
		subtitle: 'Your account is ready to use',
		currentWallet
	};
};
