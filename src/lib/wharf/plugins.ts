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
import { WalletPluginWebAuthenticator } from '@wharfkit/wallet-plugin-web-authenticator';
import { WalletPluginWombat } from '@wharfkit/wallet-plugin-wombat';

import { TransactPluginResourceProvider } from '@wharfkit/transact-plugin-resource-provider';
import { TransactPluginStatusEmitter } from '$lib/wharf/plugins/status';

import { chains, getChainDefinitionFromParams } from '$lib/wharf/chains';
import { isENVTrue } from '$lib/utils/strings';

export const baseWalletPlugins: WalletPlugin[] = [];

if (isENVTrue(PUBLIC_WALLET_ANCHOR)) {
	baseWalletPlugins.push(new WalletPluginAnchor());
}

if (isENVTrue(PUBLIC_WALLET_CLOUDWALLET)) {
	baseWalletPlugins.push(new WalletPluginCloudWallet());
}

if (isENVTrue(PUBLIC_WALLET_IMTOKEN)) {
	baseWalletPlugins.push(new WalletPluginIMToken());
}

if (isENVTrue(PUBLIC_WALLET_METAMASK)) {
	baseWalletPlugins.push(
		new WalletPluginMetaMask({
			snapOrigin: PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN
		})
	);
}

if (isENVTrue(PUBLIC_WALLET_SCATTER)) {
	baseWalletPlugins.push(new WalletPluginScatter());
}

if (isENVTrue(PUBLIC_WALLET_TOKENPOCKET)) {
	baseWalletPlugins.push(new WalletPluginTokenPocket());
}

if (isENVTrue(PUBLIC_WALLET_WEB_AUTHENTICATOR)) {
	baseWalletPlugins.push(
		new WalletPluginWebAuthenticator({
			webAuthenticatorUrl: 'https://adding-ledger-plugin.web-authenticator-a83.pages.dev'
		})
	);
}

if (isENVTrue(PUBLIC_WALLET_WOMBAT)) {
	baseWalletPlugins.push(new WalletPluginWombat());
}

// If a local key is provided, add the private key wallet
if (PUBLIC_LOCAL_SIGNER) {
	baseWalletPlugins.unshift(new WalletPluginPrivateKey(PUBLIC_LOCAL_SIGNER));
}

export const walletPlugins = [
	...baseWalletPlugins,
	new WalletPluginMultiSig({ walletPlugins: baseWalletPlugins })
];

export const transactPlugins: TransactPlugin[] = [
	new TransactPluginStatusEmitter(),
	new TransactPluginResourceProvider()
];

export const msigTransactPlugins: TransactPlugin[] = [new TransactPluginStatusEmitter()];
export const msigInternalPlugins: TransactPlugin[] = [new TransactPluginResourceProvider()];

export const chainDefs: ChainDefinition[] = chains.map((chain) =>
	getChainDefinitionFromParams(chain.short)
);
