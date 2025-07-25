import type { MetaMaskInpageProvider } from '@metamask/providers';
import { isLocalSnap, type Snap } from '../metamask-snap';
import type { PublicKey } from '@wharfkit/antelope';

export class MetaMaskState {
	public snapProvider = $state<MetaMaskInpageProvider | null>(null);
	public snapOrigin = $state<string | undefined>(undefined);
	public isFlask = $state(false);
	public isInstalled = $state(false);
	public error = $state<Error | null>(null);
	public installedSnap = $state<Snap | null>(null);
	public publicKey = $state<PublicKey | null>(null); // active
	public ownerKey = $state<PublicKey | null>(null); // owner

	public snapsDetected = $derived(this.snapProvider !== null);

	public isMetaMaskReady = $derived(
		isLocalSnap(this.snapOrigin || '') ? this.isFlask : this.snapsDetected
	);

	toJSON() {
		return {
			snapsDetected: this.snapsDetected,
			isMetaMaskReady: this.isMetaMaskReady,
			snapOrigin: this.snapOrigin,
			isFlask: this.isFlask,
			isInstalled: this.isInstalled,
			error: this.error,
			installedSnap: this.installedSnap,
			publicKey: this.publicKey,
			ownerKey: this.ownerKey
		};
	}
}
