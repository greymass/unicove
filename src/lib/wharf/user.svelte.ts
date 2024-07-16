import { browser } from '$app/environment';

import { PUBLIC_LOCAL_SIGNER } from '$env/static/public';

import {
	type LoginOptions,
	type RestoreArgs,
	type SerializedSession,
	type WalletPlugin,
	Session,
	SessionKit
} from '@wharfkit/session';
import WebRenderer from '@wharfkit/web-renderer';

import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';

import { chain } from '.';

const walletPlugins: WalletPlugin[] = [new WalletPluginAnchor()];

// If a local key is provided, add the private key wallet
if (PUBLIC_LOCAL_SIGNER) {
	walletPlugins.unshift(new WalletPluginPrivateKey(PUBLIC_LOCAL_SIGNER));
}

export class User {
	public session: Session | undefined = $state<Session | undefined>();
	public sessions: SerializedSession[] = $state([]);
	public sessionKit: SessionKit;

	constructor() {
		this.sessionKit = new SessionKit({
			appName: 'unicove',
			chains: [chain],
			ui: new WebRenderer({ minimal: true }),
			walletPlugins
		});
	}

	public async login(options?: LoginOptions) {
		const result = await this.sessionKit.login(options);
		this.session = result.session;
		this.sessions = await this.sessionKit.getSessions();
	}

	public async logout(session?: Session | SerializedSession) {
		await this.sessionKit.logout(session);
		this.sessions = await this.sessionKit.getSessions();
		if (this.sessions.length > 0) {
			await this.switch(this.sessions[0]);
		} else {
			this.session = undefined;
		}
	}

	public async restore(args?: RestoreArgs, options?: LoginOptions) {
		const restored = await this.sessionKit.restore(args, options);
		if (restored) {
			this.session = restored;
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

export let user: User | undefined;

if (browser) {
	user = new User();
}
