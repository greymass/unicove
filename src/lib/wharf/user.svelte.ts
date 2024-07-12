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

export const sessionKit = new SessionKit({
	appName: 'unicove',
	chains: [chain],
	ui: new WebRenderer({ minimal: true }),
	walletPlugins
});

export class User {
	public session: Session | undefined = $state<Session | undefined>();
	public sessions: SerializedSession[] = $state([]);

	public async login(options?: LoginOptions) {
		const result = await sessionKit.login(options);
		this.session = result.session;
		this.sessions = await sessionKit.getSessions();
	}

	public async logout(session?: Session | SerializedSession) {
		// Perform the requested logout
		await sessionKit.logout(session);

		// Retrieve any remaining sessions
		this.sessions = await sessionKit.getSessions();

		if (this.sessions.length > 0) {
			// If any sessions remain, switch to the first available one
			await this.switch(this.sessions[0]);
		} else {
			// otherwise clear the session
			this.session = undefined;
		}
	}

	public async restore(args?: RestoreArgs, options?: LoginOptions) {
		const restored = await sessionKit.restore(args, options);
		if (restored) {
			console.log('restored, setting session');
			this.session = restored;
		}
		this.sessions = await sessionKit.getSessions();
		return restored;
	}

	public async switch(serialized: SerializedSession): Promise<Session> {
		console.log('switching', serialized);
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

export const user = new User();
