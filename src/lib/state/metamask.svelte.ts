import type { MetaMaskInpageProvider } from '@metamask/providers';
import { derived, writable, type Readable, type Writable } from 'svelte/store';
import { isLocalSnap, defaultSnapOrigin, type Snap } from '../metamask/snap';

export const snapProvider: Writable<MetaMaskInpageProvider | null> = writable(null);

export const snapsDetected: Readable<boolean> = derived(
	snapProvider,
	($provider) => $provider !== null
);

export const isFlask: Writable<boolean> = writable(false);

export const isMetaMaskReady: Readable<boolean> = derived(
	[snapsDetected, isFlask],
	([$snapsDetected, $isFlask]) => (isLocalSnap(defaultSnapOrigin) ? $isFlask : $snapsDetected)
);

export const error: Writable<Error | null> = writable(null);

export const installedSnap: Writable<Snap | null> = writable(null);
