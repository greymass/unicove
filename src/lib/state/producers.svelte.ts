import type { NetworkState } from '$lib/state/network.svelte';
import * as SystemContract from '$lib/wharf/contracts/system';

export class ProducersState {
	public network: NetworkState;
	public producers = $state<SystemContract.Types.producer_info[]>([]);
	public loading = $state(false);
	public error = $state<string | null>(null);

	constructor(network: NetworkState) {
		this.network = network;
	}

	async loadProducers(): Promise<void> {
		this.loading = true;
		this.error = null;
		try {
			const networkShort = this.network.config.short;
			const response = await fetch(`/en/${networkShort}/api/producers`);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}
			const data = await response.json();
			this.producers = data.producers;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load producers';
			console.error('Error loading producers:', e);
		} finally {
			this.loading = false;
		}
	}

	get activeProducers() {
		return this.producers
			.filter((p) => p.is_active && Number(p.total_votes) > 0)
			.toSorted((a, b) => Number(b.total_votes) - Number(a.total_votes));
	}

	get top21() {
		return this.activeProducers.slice(0, 21);
	}

	get standby() {
		return this.activeProducers.slice(21);
	}

	get totalVotes() {
		return this.activeProducers.reduce((acc, p) => acc + Number(p.total_votes), 0);
	}

	get statistics() {
		const top21Threshold = Number(this.activeProducers[20]?.total_votes || 0);
		return {
			totalActive: this.activeProducers.length,
			totalVotes: this.totalVotes,
			top21Threshold
		};
	}
}
