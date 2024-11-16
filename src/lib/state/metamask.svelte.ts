import type { MetaMaskInpageProvider } from '@metamask/providers';
import { isLocalSnap, type Snap } from '../metamask-snap';

export class MetaMaskState {
	public snapProvider = $state<MetaMaskInpageProvider | null>(null);
	public snapOrigin = $state<string | undefined>(undefined);
	public isFlask = $state(false);
	public error = $state<Error | null>(null);
	public installedSnap = $state<Snap | null>(null);

	public snapsDetected = $derived(this.snapProvider !== null);

	public isMetaMaskReady = $derived(
		isLocalSnap(this.snapOrigin || '') ? this.isFlask : this.snapsDetected
	);
}
