import { browser } from '$app/environment';
import { PUBLIC_LOCAL_SIGNER } from '$env/static/public';

import {
	type LoginOptions,
	type RestoreArgs,
	type SerializedSession,
	type WalletPlugin,
	APIClient,
	Chains,
	Session,
	SessionKit
} from '@wharfkit/session';
import WebRenderer from '@wharfkit/web-renderer';

import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { Account, AccountKit } from '@wharfkit/account';
import ContractKit, { Contract } from '@wharfkit/contract';
import { Contract as TokenContract } from './contracts/token';
import { Contract as SystemContract } from './contracts/system';

const walletPlugins: WalletPlugin[] = [new WalletPluginAnchor()];

// If a local key is provided, add the private key wallet
if (PUBLIC_LOCAL_SIGNER) {
	walletPlugins.unshift(new WalletPluginPrivateKey(PUBLIC_LOCAL_SIGNER));
}

interface DefaultContracts {
	token?: TokenContract;
	system?: SystemContract;
}

export class WharfService {
	public account: Account | undefined = $state<Account | undefined>();
	public accountKit: AccountKit | undefined = $state<AccountKit | undefined>();
	public contracts: DefaultContracts = $state({});
	public contractKit: ContractKit | undefined = $state<ContractKit | undefined>();
	public session: Session | undefined = $state<Session | undefined>();
	public sessions: SerializedSession[] = $state([]);
	public sessionKit: SessionKit | undefined;

	init() {
		if (!browser) {
			throw new Error('Wharf should only be used in the browser');
		}
		const chain = Chains.Jungle4;
		const client = new APIClient({ url: chain.url });

		this.accountKit = new AccountKit(chain, {
			client
		});

		this.contractKit = new ContractKit({
			client
		});

		this.sessionKit = new SessionKit({
			appName: 'unicove',
			chains: [chain],
			ui: new WebRenderer({ minimal: true }),
			walletPlugins
		});

		this.contracts.token = new TokenContract({ client });
		this.contracts.system = new SystemContract({ client });
	}

	private async loadAccount() {
		if (!this.accountKit) {
			throw new Error('AccountKit not initialized');
		}
		if (!this.session) {
			throw new Error('Session not initialized');
		}
		this.account = await this.accountKit.load(this.session.actor);
	}

	public async login(options?: LoginOptions) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}
		const result = await this.sessionKit.login(options);
		this.session = result.session;
		this.sessions = await this.sessionKit.getSessions();
		await this.loadAccount();
	}

	public async logout(session?: Session | SerializedSession) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}
		await this.sessionKit.logout(session);
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
		const restored = await this.sessionKit.restore(args, options);
		if (restored) {
			this.session = restored;
			await this.loadAccount();
		}
		this.sessions = await this.sessionKit.getSessions();
		return restored;
	}

	public async switch(serialized: SerializedSession): Promise<Session> {
		const session = await this.restore({
			chain: serialized.chain,
			actor: serialized.actor,
			permission: serialized.permission,
			walletPlugin: serialized.walletPlugin
		});
		if (!session) {
			throw new Error(`Failed to switch session to ${JSON.stringify(serialized)}`);
		}
		return session;
	}
}

export const wharf = new WharfService();
