interface WalletType {
	type: 'hardware' | 'desktop' | 'mobile' | 'extensions';
	title: string;
	description: string;
	benefits: string[];
	wallets: { name: string; route: string }[];
}

export const walletTypes: Record<string, WalletType> = {
	// webAuths: {
	// 	type: 'webAuths',
	// 	title: 'Web Authenticators',
	// 	description:
	// 		"Web Authenticators are convenient wallet options that don't require any installation.",
	// 	benefits: [
	// 		'No software installation needed',
	// 		'Access your account from any device with a web browser',
	// 		'Relatively secure and easy to use'
	// 	],
	// 	wallets: [{ name: 'Anchor Web', route: 'anchor' }]
	// },
	hardware: {
		type: 'hardware',
		title: 'Hardware Wallets',
		description: 'Hardware wallets are physical devices that securely store your private keys.',
		benefits: [
			'Highest level of security',
			'Offline storage of private keys',
			'Support for multiple cryptocurrencies'
		],
		wallets: [{ name: 'Ledger', route: 'signup/wallet/ledger' }]
	},
	desktop: {
		type: 'desktop',
		title: 'Desktop Wallets',
		description: 'Software wallets are applications you install on your computer or mobile device.',
		benefits: [
			'Easy to use and set up',
			'Convenient for frequent transactions',
			'Often free to download and use'
		],
		wallets: [
			{ name: 'Anchor', route: 'signup/wallet/anchor/desktop' },
			{ name: 'Wombat', route: 'signup/wallet/wombat/desktop' }
		]
	},
	mobile: {
		type: 'mobile',
		title: 'Mobile Wallets',
		description: 'Mobile wallets are applications you install on your mobile device.',
		benefits: [
			'Convenient for on-the-go access',
			'Secure storage of your digital assets on your mobile device',
			'Quick and easy transactions from your smartphone'
		],
		wallets: [
			{ name: 'Anchor Mobile', route: 'signup/wallet/anchor/mobile' },
			{ name: 'Wombat Mobile', route: 'signup/wallet/wombat/mobile' },
			{ name: 'TokenPocket', route: 'signup/wallet/tokenpocket' }
		]
	},
	extensions: {
		type: 'extensions',
		title: 'Browser Extensions',
		description:
			'Browser extension wallets integrate directly with your web browser for easy access.',
		benefits: [
			'Seamless integration with web applications',
			'Quick access from your browser',
			'Easy to use for web3 interactions'
		],
		wallets: [
			{ name: 'MetaMask', route: 'signup/wallet/metamask' },
			{ name: 'Wombat', route: 'signup/wallet/wombat/extension' }
		]
	}
};

export function getWalletType(path: string) {
	return Object.values(walletTypes).find((walletType) => {
		return walletType.wallets.some((wallet) => path.includes(wallet.route));
	});
}
