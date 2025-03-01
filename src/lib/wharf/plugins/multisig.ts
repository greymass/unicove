import { type Cancelable, cancelable } from '@wharfkit/common';
import {
	AbstractWalletPlugin,
	type WalletPlugin,
	type WalletPluginConfig,
	WalletPluginMetadata,
	LoginContext,
	type WalletPluginLoginResponse,
	Checksum256,
	TransactContext,
	Session,
	PermissionLevel,
	ResolvedSigningRequest,
	type WalletPluginSignResponse,
	Transaction,
	TimePoint
} from '@wharfkit/session';

import { Contract as MsigContract } from '$lib/wharf/contracts/msig';
import { Contract as TimeContract } from '$lib/wharf/contracts/eosntime';
import { generateRandomName } from '$lib/utils/random';
import { msigInternalPlugins } from '$lib/wharf/plugins';

export interface WalletPluginMultiSigOptions {
	walletPlugins: WalletPlugin[];
}

export class WalletPluginMultiSig extends AbstractWalletPlugin implements WalletPlugin {
	public id = 'wallet-plugin-multisig';

	readonly config: WalletPluginConfig = {
		requiresChainSelect: true,
		requiresPermissionEntry: true,
		requiresPermissionSelect: true
	};

	readonly metadata: WalletPluginMetadata = WalletPluginMetadata.from({
		name: 'MultiSig Proposer',
		description: ''
	});

	private walletPlugins: WalletPlugin[] = [];

	constructor(options: WalletPluginMultiSigOptions) {
		super();
		this.walletPlugins = options.walletPlugins;
	}

	login(context: LoginContext): Cancelable<WalletPluginLoginResponse> {
		let chain: Checksum256;
		// Persist the parent session that was passed in arbitrary
		this.data.session = context.arbitrary.session;
		this.data.expireSeconds = 60 * 60 * 24 * 365; // 1 year
		if (context.chain) {
			chain = context.chain.id;
		} else {
			chain = context.chains[0].id;
		}
		return cancelable(
			new Promise((resolve, reject) => {
				if (!context.permissionLevel) {
					return reject(
						'Calling login() without a permissionLevel is not supported by the WalletPluginMultiSig plugin.'
					);
				}
				resolve({
					chain,
					permissionLevel: context.permissionLevel
				});
			})
		);
	}

	getSession(context: TransactContext): Session {
		const walletPlugin = this.walletPlugins.find(
			(plugin) => plugin.id === this.data.session.walletPlugin.id
		);
		if (!walletPlugin) {
			throw new Error('Wallet plugin not found');
		}
		return new Session(
			{
				chain: context.chain,
				permissionLevel: PermissionLevel.from({
					actor: this.data.session.actor,
					permission: this.data.session.permission
				}),
				walletPlugin
			},
			{
				ui: context.ui
			}
		);
	}

	async getSigners(signer: PermissionLevel, context: TransactContext): Promise<PermissionLevel[]> {
		const account = await context.client.v1.chain.get_account(signer.actor);
		const permission = account.permissions.find((p) => p.perm_name.equals(signer.permission));
		if (!permission) {
			throw new Error('Requested permission not found');
		}
		return permission.required_auth.accounts.map((a) => a.permission);
	}

	async propose(
		resolved: ResolvedSigningRequest,
		context: TransactContext
	): Promise<WalletPluginSignResponse> {
		const requested = await this.getSigners(resolved.signer, context);
		const session = this.getSession(context);
		const msig = new MsigContract({ client: context.client });
		const eosntime = new TimeContract({ client: context.client });

		let expireSeconds = 60 * 60 * 24 * 30; // 1 month
		if (this.data.expireSeconds) {
			expireSeconds = this.data.expireSeconds;
		}

		if (!context.info) {
			throw new Error('Missing transaction info');
		}

		const trx = Transaction.from({
			...context.info.getTransactionHeader(expireSeconds),
			actions: resolved.transaction.actions,
			context_free_actions: [],
			transaction_extensions: []
		});

		const actions = [
			msig.action(
				'propose',
				{
					proposal_name: generateRandomName(),
					proposer: session.actor,
					requested,
					trx
				},
				{
					authorization: [session.permissionLevel]
				}
			)
		];

		if (this.data.earliestExecution) {
			const date = new Date(this.data.earliestExecution);
			const time = TimePoint.fromDate(date);
			actions.push(eosntime.action('checktime', { time }));
		}

		const result = await session.transact(
			{ actions },
			{ broadcast: false, transactPlugins: msigInternalPlugins }
		);
		return {
			resolved: result.resolved,
			signatures: result.signatures
		};
	}

	sign(
		resolved: ResolvedSigningRequest,
		context: TransactContext
	): Cancelable<WalletPluginSignResponse> {
		const promise = this.propose(resolved, context);
		return cancelable(promise, (canceled) => {
			throw canceled;
		});
	}
}
