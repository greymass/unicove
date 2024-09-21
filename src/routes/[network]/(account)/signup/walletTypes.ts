interface WalletType {
	title: string;
	description: string;
	benefits: string[];
	wallets: { name: string; route: string }[];
}

export const walletTypes: Record<string, WalletType> = {
	// webAuths: {
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
	hardwallets: {
		title: 'Hardware Wallets',
		description: 'Hardware wallets are physical devices that securely store your private keys.',
		benefits: [
			'Highest level of security',
			'Offline storage of private keys',
			'Support for multiple cryptocurrencies'
		],
		wallets: [{ name: 'Ledger', route: 'ledger' }]
	},
	desktopwallets: {
		title: 'Desktop Wallets',
		description: 'Software wallets are applications you install on your computer or mobile device.',
		benefits: [
			'Easy to use and set up',
			'Convenient for frequent transactions',
			'Often free to download and use'
		],
		wallets: [
			{ name: 'Anchor', route: 'anchor/desktop' },
			{ name: 'Wombat', route: 'wombat/desktop' }
		]
	},
	mobilewallets: {
		title: 'Mobile Wallets',
		description: 'Mobile wallets are applications you install on your mobile device.',
		benefits: [
			'Convenient for on-the-go access',
			'Secure storage of your digital assets on your mobile device',
			'Quick and easy transactions from your smartphone'
		],
		wallets: [
			{ name: 'Anchor Mobile', route: 'anchor/mobile' },
			{ name: 'Wombat Mobile', route: 'wombat/mobile' },
			{ name: 'TokenPocket', route: 'tokenpocket' }
		]
	},
	extensions: {
		title: 'Browser Extensions',
		description:
			'Browser extension wallets integrate directly with your web browser for easy access.',
		benefits: [
			'Seamless integration with web applications',
			'Quick access from your browser',
			'Easy to use for web3 interactions'
		],
		wallets: [
			{ name: 'MetaMask', route: 'metamask' },
			{ name: 'Wombat', route: 'wombat/extension' }
		]
	}
};
