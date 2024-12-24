import { browser } from '$app/environment';
import {
	PUBLIC_LOCAL_SIGNER,
	PUBLIC_METAMASK_SERVICE_URL,
	PUBLIC_METAMASK_SNAP_ORIGIN
} from '$env/static/public';

import { ChainDefinition, Chains } from '@wharfkit/common';
import {
	type AccountCreationPlugin,
	type CreateAccountOptions,
	type LoginOptions,
	type RestoreArgs,
	type SerializedSession,
	type TransactArgs,
	type TransactOptions,
	type TransactPlugin,
	type TransactResult,
	type WalletPlugin,
	Session,
	SessionKit
} from '@wharfkit/session';
import WebRenderer from '@wharfkit/web-renderer';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginMetaMask } from '@wharfkit/wallet-plugin-metamask';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { WalletPluginWombat } from '@wharfkit/wallet-plugin-wombat';
import { WalletPluginScatter } from '@wharfkit/wallet-plugin-scatter';
import { WalletPluginTokenPocket } from '@wharfkit/wallet-plugin-tokenpocket';
import { WalletPluginWebAuthenticator } from '@wharfkit/wallet-plugin-web-authenticator';
import { TransactPluginResourceProvider } from '@wharfkit/transact-plugin-resource-provider';

import { AccountCreationPluginMetamask } from '@wharfkit/account-creation-plugin-metamask';

import { TransactPluginStatusEmitter } from '$lib/wharf/plugins/status';

import {
	type QueuedTransaction,
	StatusType,
	queueTransaction,
	sendErrorToast
	// sendSuccessToast
} from '$lib/wharf/transact.svelte';

import { chainMapper } from '$lib/wharf/chains';
import type { SettingsState } from '../settings.svelte';
import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';

const defaultWalletPlugins: WalletPlugin[] = [
	new WalletPluginAnchor(),
	new WalletPluginMetaMask(),
	new WalletPluginScatter(),
	new WalletPluginTokenPocket(),
	new WalletPluginWombat(),
	new WalletPluginWebAuthenticator({
		webAuthenticatorUrl: 'https://mvp.web-authenticator-a83.pages.dev'
	})
];

export const accountCreationPluginMetamask = new AccountCreationPluginMetamask({
	accountCreationServiceUrl: PUBLIC_METAMASK_SERVICE_URL,
	snapOrigin: PUBLIC_METAMASK_SNAP_ORIGIN
});

const accountCreationPlugins: AccountCreationPlugin[] = [accountCreationPluginMetamask];

const transactPlugins: TransactPlugin[] = [
	new TransactPluginStatusEmitter(),
	new TransactPluginResourceProvider()
];

// If a local key is provided, add the private key wallet
if (PUBLIC_LOCAL_SIGNER) {
	defaultWalletPlugins.unshift(new WalletPluginPrivateKey(PUBLIC_LOCAL_SIGNER));
}

export class WharfState {
	public chains: ChainDefinition[] = [Chains.EOS, Chains.Jungle4, Chains.KylinTestnet];
	public chainsSession: Record<string, SerializedSession | undefined> = $state({});
	public session?: Session = $state<Session>();
	public sessions: SerializedSession[] = $state([]);
	public sessionKit?: SessionKit;
	public transacting = $state(false);
	public settings: SettingsState = $state() as SettingsState;

	constructor(settings: SettingsState) {
		this.settings = settings;
		if (browser) {
			this.chainsSession = JSON.parse(localStorage.getItem('chainsSession') || '{}');
		}
	}

	init() {
		if (!browser) {
			throw new Error('Wharf should only be used in the browser');
		}
		const walletPlugins = [...defaultWalletPlugins];
		if (this.settings.data.advancedMode) {
			walletPlugins.push(new WalletPluginCleos());
		}
		this.sessionKit = new SessionKit(
			{
				appName: 'unicove',
				chains: this.chains,
				ui: new WebRenderer({ minimal: true }),
				walletPlugins
			},
			{
				accountCreationPlugins,
				transactPlugins
			}
		);
		$effect.root(() => {
			$effect(() => {
				localStorage.setItem('chainsSession', JSON.stringify(this.chainsSession));
			});
		});
	}

	public setSettings(settings: SettingsState) {
		this.settings = settings;
		this.init();
	}

	public async login(options?: LoginOptions) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}

		const { session } = await this.sessionKit.login(options);
		this.session = session;
		this.chainsSession[String(session.chain.id)] = session.serialize();
		this.sessions = await this.sessionKit.getSessions();
	}

	public async createAccount(createAccountOptions?: CreateAccountOptions) {
		if (!this.sessionKit) {
			throw new Error('Session Kit not initialized');
		}
		return this.sessionKit.createAccount(createAccountOptions);
	}

	public async logout(session?: Session | SerializedSession) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}
		await this.sessionKit.logout(session);
		if (session) {
			if (session instanceof Session) {
				this.chainsSession[String(session.chain.id)] = undefined;
			} else {
				this.chainsSession[String(session.chain)] = undefined;
			}
		} else {
			this.chainsSession = {};
		}
		this.sessions = await this.sessionKit.getSessions();
		if (this.sessions.length > 0) {
			await this.switch(this.sessions[0]);
		} else {
			this.session = undefined;
		}
	}

	public async restore(args?: RestoreArgs, options?: LoginOptions) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}
		// TODO: If the current account matches the account we're switching to, just return the current session
		const session = await this.sessionKit.restore(args, options);
		if (session) {
			this.session = session;
		}
		this.sessions = await this.sessionKit.getSessions();
		return session;
	}

	public async switch(serialized: SerializedSession): Promise<Session> {
		const session = await this.restore({
			chain: serialized.chain,
			actor: serialized.actor,
			permission: serialized.permission,
			walletPlugin: serialized.walletPlugin
		});
		this.chainsSession[String(serialized.chain)] = serialized;
		// TODO: Redirect to the appropriate network in the URL
		if (!session) {
			throw new Error(`Failed to switch session to ${JSON.stringify(serialized)}`);
		}
		return session;
	}

	public reset() {
		this.session = undefined;
	}

	async transact(args: TransactArgs, options?: TransactOptions): Promise<TransactResult> {
		if (!this.session) {
			throw new Error('No active session available to transact with.');
		}

		this.transacting = true;

		const transaction: QueuedTransaction = {
			status: StatusType.CREATED,
			chain: this.session.chain.id,
			network: chainMapper.toShortName(String(this.session.chain.id)),
			args,
			options
		};

		const result = await this.session.transact(args).catch((e: Error) => {
			transaction.status = StatusType.ERROR;
			transaction.error = String(e);
			queueTransaction(transaction);
			const { id } = sendErrorToast(transaction);
			transaction.toastId = id;
			this.transacting = false;
			throw e;
		});

		this.transacting = false;

		if (!result.resolved || !result.response) {
			transaction.status = StatusType.ERROR;
			transaction.error = 'Transaction was not resolved.';
			const { id } = sendErrorToast(transaction);
			transaction.toastId = id;

			queueTransaction(transaction);
			throw new Error('Transaction was not resolved.');
		}

		transaction.status = StatusType.BROADCAST;
		transaction.response = result.response;
		transaction.transaction = result.resolved.transaction;
		// const { id } = sendSuccessToast(transaction);
		// transaction.toastId = id;
		queueTransaction(transaction);

		return result;
	}
}
