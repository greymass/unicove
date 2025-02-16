import type { Transport } from '@sveltejs/kit';

import { i18n } from '$lib/i18n';
import { NetworkState, type SerializedNetworkState } from '$lib/state/network.svelte';
import { AccountState, type SerializedAccountState } from '$lib/state/client/account.svelte';
import { Name } from '@wharfkit/antelope';

export const reroute = i18n.reroute();

export const transport: Transport = {
	AccountState: {
		encode: (state) => {
			if (state instanceof AccountState) {
				return state.serialized;
			}
		},
		decode: (serialized: SerializedAccountState) => {
			const network = new NetworkState(serialized.network.config);
			if (serialized.network.sources) {
				network.setState(serialized.network.sources);
			}
			const state = new AccountState(network, serialized.name);
			state.setState(serialized.sources);
			return state;
		}
	},
	Name: {
		encode: (name) => {
			if (name instanceof Name) {
				return String(name);
			}
		},
		decode: (name) => {
			return Name.from(name);
		}
	},
	NetworkState: {
		encode: (state) => {
			if (state instanceof NetworkState) {
				return state.getState();
			}
		},
		decode: (serialized: SerializedNetworkState) => {
			const state = new NetworkState(serialized.config);
			if (serialized.sources) {
				state.setState(serialized.sources);
			}
			return state;
		}
	}
};
