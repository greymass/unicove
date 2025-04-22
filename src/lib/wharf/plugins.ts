import { env } from '$env/dynamic/public';
import type { ChainDefinition } from '@wharfkit/common';
import type { WalletPlugin, TransactPlugin } from '@wharfkit/session';

import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginMetaMask } from '@wharfkit/wallet-plugin-metamask';
import { WalletPluginMultiSig } from '$lib/wharf/plugins/multisig';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { WalletPluginScatter } from '@wharfkit/wallet-plugin-scatter';
import { WalletPluginTokenPocket } from '@wharfkit/wallet-plugin-tokenpocket';
import { WalletPluginWombat } from '@wharfkit/wallet-plugin-wombat';

import { TransactPluginResourceProvider } from '@wharfkit/transact-plugin-resource-provider';
import { TransactPluginStatusEmitter } from '$lib/wharf/plugins/status';

import { chains, getChainDefinitionFromParams } from '$lib/wharf/chains';

console.log('env snap origin', env.PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN);

export const baseWalletPlugins: WalletPlugin[] = [
	new WalletPluginAnchor(),
	new WalletPluginMetaMask({
		snapOrigin: env.PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN
	}),
	new WalletPluginScatter(),
	new WalletPluginTokenPocket(),
	new WalletPluginWombat()
];

console.log(
	new WalletPluginMetaMask({
		snapOrigin: env.PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN
	})
);

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
	getChainDefinitionFromParams(chain.short)
);
