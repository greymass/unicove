import { browser } from '$app/environment';
import { PUBLIC_LOCAL_SIGNER } from '$env/static/public';

import { getContext, setContext } from 'svelte';
import type { Checksum256 } from '@wharfkit/antelope';
import { ChainDefinition, Chains } from '@wharfkit/common';
import {
	type LoginOptions,
	type RestoreArgs,
	type SerializedSession,
	type TransactArgs,
	type TransactOptions,
	type TransactResult,
	type WalletPlugin,
	Session,
	SessionKit
} from '@wharfkit/session';
import WebRenderer from '@wharfkit/web-renderer';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginMetaMask } from '@wharfkit/wallet-plugin-metamask';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';

import { TransactPluginStatusEmitter } from '$lib/wharf/plugins/status';
import {
	type QueuedTransaction,
	StatusType,
	queueTransaction,
	sendErrorToast,
	sendSuccessToast
} from '$lib/wharf/transact.svelte';

const walletPlugins: WalletPlugin[] = [new WalletPluginAnchor(), new WalletPluginMetaMask()];

// If a local key is provided, add the private key wallet
if (PUBLIC_LOCAL_SIGNER) {
	walletPlugins.unshift(new WalletPluginPrivateKey(PUBLIC_LOCAL_SIGNER));
}

export class WharfState {
	public chains: ChainDefinition[] = [Chains.EOS, Chains.Jungle4, Chains.Telos];
	public chainsSession: Record<string, SerializedSession | undefined> = $state({});
	public session?: Session = $state<Session>();
	public sessions: SerializedSession[] = $state([]);
	public sessionKit?: SessionKit;

	constructor() {
		if (browser) {
			this.chainsSession = JSON.parse(localStorage.getItem('chainSessions') || '{}');
		}
	}

	init() {
		if (!browser) {
			throw new Error('Wharf should only be used in the browser');
		}
		this.sessionKit = new SessionKit({
			appName: '2nicove',
			chains: this.chains,
			ui: new WebRenderer({ minimal: true }),
			walletPlugins
		});
		$effect(() => {
			localStorage.setItem('chainSessions', JSON.stringify(this.chainsSession));
		});
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

	async transact(
		args: TransactArgs,
		options?: TransactOptions
	): Promise<TransactResult | undefined> {
		if (!this.session) {
			throw new Error('No active session available to transact with.');
		}

		const transaction: QueuedTransaction = {
			status: StatusType.CREATED,
			args,
			options
		};

		const result = await this.session
			.transact(args, {
				...options,
				transactPlugins: [new TransactPluginStatusEmitter()]
			})
			.catch((e: Error) => {
				transaction.status = StatusType.ERROR;
				transaction.error = String(e);
				queueTransaction(transaction);
				const { id } = sendErrorToast(transaction);
				transaction.toastId = id;
				throw e;
			});

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
		const { id } = sendSuccessToast(transaction);
		transaction.toastId = id;
		queueTransaction(transaction);

		return result;
	}
}

export function getWharf(): WharfState {
	const contextKey = 'wharf';
	if (!getContext(contextKey)) {
		setContext(contextKey, new WharfState());
	}
	return getContext(contextKey);
}
