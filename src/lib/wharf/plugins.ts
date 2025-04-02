import { env } from '$env/dynamic/public';
import type { ChainDefinition } from '@wharfkit/common';
import type { WalletPlugin, TransactPlugin } from '@wharfkit/session';

import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
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

export const baseWalletPlugins: WalletPlugin[] = [
	new WalletPluginAnchor(),
	new WalletPluginMetaMask(),
	new WalletPluginScatter(),
	new WalletPluginTokenPocket(),
	new WalletPluginWombat(),
	new WalletPluginWebAuthenticator({
		// webAuthenticatorUrl: 'https://adding-metakeep-signing-meth.web-authenticator-a83.pages.dev'
		webAuthenticatorUrl: 'http://localhost:5173'
	})
];

// If a local key is provided, add the private key wallet
if (env.PUBLIC_LOCAL_SIGNER) {
	baseWalletPlugins.unshift(new WalletPluginPrivateKey(env.PUBLIC_LOCAL_SIGNER));
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
	getChainDefinitionFromParams(chain.name)
);
