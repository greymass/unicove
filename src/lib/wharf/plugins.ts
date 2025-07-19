import {
	PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN,
	PUBLIC_LOCAL_SIGNER,
	PUBLIC_WALLET_ANCHOR,
	PUBLIC_WALLET_CLOUDWALLET,
	PUBLIC_WALLET_IMTOKEN,
	PUBLIC_WALLET_METAMASK,
	PUBLIC_WALLET_SCATTER,
	PUBLIC_WALLET_TOKENPOCKET,
	PUBLIC_WALLET_WEB_AUTHENTICATOR,
	PUBLIC_WALLET_WOMBAT
} from '$env/static/public';
import type { ChainDefinition } from '@wharfkit/common';
import type { WalletPlugin, TransactPlugin } from '@wharfkit/session';

import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet';
import { WalletPluginIMToken } from '@wharfkit/wallet-plugin-imtoken';
import { WalletPluginMetaMask } from '@wharfkit/wallet-plugin-metamask';
import { WalletPluginMultiSig } from '$lib/wharf/plugins/multisig';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { WalletPluginScatter } from '@wharfkit/wallet-plugin-scatter';
import { WalletPluginTokenPocket } from '@wharfkit/wallet-plugin-tokenpocket';
// WalletPluginWebAuthenticator will be dynamically imported to avoid crypto module resolution errors during build
import { WalletPluginWombat } from '@wharfkit/wallet-plugin-wombat';

import { TransactPluginResourceProvider } from '@wharfkit/transact-plugin-resource-provider';
import { TransactPluginStatusEmitter } from '$lib/wharf/plugins/status';

import { chains, getChainDefinitionFromParams } from '$lib/wharf/chains';
import { isENVTrue } from '$lib/utils/strings';

// Async function to build wallet plugins with dynamic imports
async function buildBasePlugins(): Promise<WalletPlugin[]> {
	const plugins: WalletPlugin[] = [];

	if (isENVTrue(PUBLIC_WALLET_ANCHOR)) {
		plugins.push(new WalletPluginAnchor());
	}

	if (isENVTrue(PUBLIC_WALLET_CLOUDWALLET)) {
		plugins.push(new WalletPluginCloudWallet());
	}

	if (isENVTrue(PUBLIC_WALLET_IMTOKEN)) {
		plugins.push(new WalletPluginIMToken());
	}

	if (isENVTrue(PUBLIC_WALLET_METAMASK)) {
		plugins.push(
			new WalletPluginMetaMask({
				snapOrigin: PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN
			})
		);
	}

	if (isENVTrue(PUBLIC_WALLET_SCATTER)) {
		plugins.push(new WalletPluginScatter());
	}

	if (isENVTrue(PUBLIC_WALLET_TOKENPOCKET)) {
		plugins.push(new WalletPluginTokenPocket());
	}

	if (isENVTrue(PUBLIC_WALLET_WEB_AUTHENTICATOR)) {
		// Dynamically import the web authenticator plugin to avoid crypto module resolution errors during build
		const { WalletPluginWebAuthenticator } = await import(
			'@wharfkit/wallet-plugin-web-authenticator'
		);
		plugins.push(
			new WalletPluginWebAuthenticator({
				webAuthenticatorUrl: 'https://implementing-ledger-pages.web-authenticator-a83.pages.dev'
			})
		);
	}

	if (isENVTrue(PUBLIC_WALLET_WOMBAT)) {
		plugins.push(new WalletPluginWombat());
	}

	// If a local key is provided, add the private key wallet
	if (PUBLIC_LOCAL_SIGNER) {
		plugins.unshift(new WalletPluginPrivateKey(PUBLIC_LOCAL_SIGNER));
	}

	return plugins;
}

export async function getWalletPlugins(): Promise<WalletPlugin[]> {
	const basePlugins = await buildBasePlugins();
	return [...basePlugins, new WalletPluginMultiSig({ walletPlugins: basePlugins })];
}

export const transactPlugins: TransactPlugin[] = [
	new TransactPluginStatusEmitter(),
	new TransactPluginResourceProvider()
];

export const msigTransactPlugins: TransactPlugin[] = [new TransactPluginStatusEmitter()];
export const msigInternalPlugins: TransactPlugin[] = [new TransactPluginResourceProvider()];

export const chainDefs: ChainDefinition[] = chains.map((chain) =>
	getChainDefinitionFromParams(chain.short)
);
