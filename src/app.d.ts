import type { NetworkState } from '$lib/state/network.svelte';

declare global {
	namespace App {
		interface Locals {
			network: NetworkState;
		}
		interface Error {
			code?: string;
		}
	}
}

export {};
