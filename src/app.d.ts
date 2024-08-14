import type { AvailableLanguageTag } from '../../lib/paraglide/runtime';
import type { ParaglideLocals } from '@inlang/paraglide-sveltekit';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			paraglide: ParaglideLocals<AvailableLanguageTag>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		ethereum: MetaMaskInpageProvider & {
			setProvider?: (provider: MetaMaskInpageProvider) => void;
			detected?: MetaMaskInpageProvider[];
			providers?: MetaMaskInpageProvider[];
		};
	}

	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface WindowEventMap {
		'eip6963:requestProvider': EIP6963RequestProviderEvent;
		'eip6963:announceProvider': EIP6963AnnounceProviderEvent;
	}
}

export {};
