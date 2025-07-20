import TabletSmartphone from '@lucide/svelte/icons/tablet-smartphone';
import LaptopMinimal from '@lucide/svelte/icons/laptop-minimal';
// import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
import GlobeLock from '@lucide/svelte/icons/globe-lock';
import type { Icon } from '@lucide/svelte';
import AnchorLogo from '$lib/assets/wallets/anchor.svg';
import WombatLogo from '$lib/assets/wallets/wombat.webp';
import TokenPocketLogo from '$lib/assets/wallets/tokenpocket.webp';
import MetaMaskLogo from '$lib/assets/wallets/metamask.svg';
// import LedgerLogo from '$lib/assets/wallets/ledger.svg';

export interface Wallet {
	name: string;
	route: string;
	description?: string;
	logo?: string;
	supportedNetworks?: string[]; // if empty, all networks are supported
}

interface WalletTypeProps {
	type: 'hardware' | 'desktop' | 'mobile' | 'extensions';
	title: string;
	description: string;
	icon: typeof Icon;
	benefits: string[];
	wallets: Wallet[];
}

export class WalletType {
	readonly type: 'hardware' | 'desktop' | 'mobile' | 'extensions';
	readonly title: string;
	readonly description: string;
	readonly icon: typeof Icon;
	readonly benefits: string[];
	readonly wallets: Wallet[];

	constructor({ type, title, description, icon, benefits, wallets }: WalletTypeProps) {
		this.type = type;
		this.title = title;
		this.description = description;
		this.icon = icon;
		this.benefits = benefits;
		this.wallets = wallets;
	}

	networkWallets(network: string): Wallet[] {
		return this.wallets.filter(
			(wallet) => !wallet.supportedNetworks || wallet.supportedNetworks.includes(network)
		);
	}
}

export const walletTypes: Record<string, WalletType> = {
	// webAuths: {
	// 	type: 'webAuths',
	// 	title: 'Web Authenticators',
	// icon: 'tablet-smartphone',
	// 	description:
	// 		"Web Authenticators are convenient wallet options that don't require any installation.",
	// 	benefits: [
	// 		'No software installation needed',
	// 		'Access your account from any device with a web browser',
	// 		'Relatively secure and easy to use'
	// 	],
	// 	wallets: [{ name: 'Anchor Web', route: 'anchor' }]
	// },
	// hardware: new WalletType({
	// 	type: 'hardware',
	// 	title: 'Hardware Wallets',
	// 	description:
	// 		'Hardware wallets are dedicated devices to securely generate and store private keys.',
	// 	icon: LockKeyhole,
	// 	benefits: [
	// 		'Highest level of security',
	// 		'Offline storage of private keys',
	// 		'Support for multiple cryptocurrencies'
	// 	],
	// 	wallets: [
	// 		{
	// 			name: 'Ledger',
	// 			route: 'signup/wallets/hardware/ledger',
	// 			logo: LedgerLogo,
	// 			supportedNetworks: ['eos', 'jungle4']
	// 		}
	// 	]
	// }),
	desktop: new WalletType({
		type: 'desktop',
		title: 'Desktop Wallets',
		description: 'Desktop wallets are standalone applications that are installed on a computer.',
		icon: LaptopMinimal,
		benefits: [
			'Standalone applications for secure key storage.',
			'Operates independent of which web browser used. ',
			'Often free to download and use'
		],
		wallets: [
			{
				name: 'MetaMask',
				route: 'signup/wallets/extensions/metamask',
				logo: MetaMaskLogo,
				description:
					'One of the most popular wallets for interacting with web3 applications. Made compatible with Antelope-based blockchains through the EOS Wallet snap.',
				supportedNetworks: ['eos', 'jungle4']
			},
			{
				name: 'Anchor',
				route: 'signup/wallets/desktop/anchor',
				logo: AnchorLogo,
				description:
					'A general purpose desktop wallet and authenticator for any Antelope-based blockchain. Supports integration with Ledger devices.',
				supportedNetworks: ['eos', 'jungle4']
			},
			{
				name: 'Wombat',
				route: 'signup/wallets/desktop/wombat',
				logo: WombatLogo,
				description:
					'A desktop wallet with a focus on gaming and NFTs. Supports multiple Antelope-based blockchains.',
				supportedNetworks: ['eos']
			}
		]
	}),
	mobile: new WalletType({
		type: 'mobile',
		title: 'Mobile Wallets',
		description: 'Mobile wallets are applications you install on your mobile device.',
		icon: TabletSmartphone,
		benefits: [
			'Convenient for on-the-go access',
			'Secure storage of your digital assets on your mobile device',
			'Quick and easy transactions from your smartphone'
		],
		wallets: [
			{
				name: 'Anchor Mobile',
				route: 'signup/wallets/mobile/anchor',
				logo: AnchorLogo,
				description:
					'Popular mobile option with a user-friendly interface. Supports multiple EOSIO chains.',
				supportedNetworks: ['eos', 'jungle4']
			},
			{
				name: 'Wombat Mobile',
				route: 'signup/wallets/mobile/wombat',
				logo: WombatLogo,
				description:
					'Fast and secure with multi-chain support. Offers a smooth onboarding experience.',
				supportedNetworks: ['eos']
			},
			{
				name: 'TokenPocket',
				route: 'signup/wallets/mobile/tokenpocket',
				logo: TokenPocketLogo,
				description: 'A leading crypto wallet that supports multiple chains.',
				supportedNetworks: ['eos']
			}
		]
	}),
	extensions: new WalletType({
		type: 'extensions',
		title: 'Browser Extensions',
		description:
			'Browser extension wallets integrate directly with your web browser for easy access.',
		icon: GlobeLock,
		benefits: [
			'Seamless integration with web applications',
			'Quick access from your browser',
			'Easy to use for web3 interactions'
		],
		wallets: [
			{
				name: 'MetaMask',
				route: 'signup/wallets/extensions/metamask',
				logo: MetaMaskLogo,
				description: 'MetaMask is a secure and easy-to-use browser extension wallet.',
				supportedNetworks: ['eos', 'jungle4']
			},
			{
				name: 'Wombat',
				route: 'signup/wallets/extensions/wombat',
				logo: WombatLogo,
				description:
					'Fast and secure with multi-chain support. Offers a smooth onboarding experience.',
				supportedNetworks: ['eos']
			}
		]
	})
};

export function getWalletTypeFromPath(path: string) {
	return Object.values(walletTypes).find((walletType) => {
		return walletType.wallets.some((wallet) => {
			return path.includes(wallet.route.split('/').slice(0, -1).join('/'));
		});
	});
}

export function getWalletFromPath(path: string) {
	return getWalletTypeFromPath(path)?.wallets.find((wallet) => path.includes(wallet.route));
}

export function getWalletNameFromPath(path: string) {
	return getWalletFromPath(path)?.name;
}
