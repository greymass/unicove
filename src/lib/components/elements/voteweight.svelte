<script lang="ts">
	import { getContext } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Asset, Float64 } from '@wharfkit/antelope';

	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'value' | 'full';
		decay?: number; // Number of weeks for voter decay
		weight: Float64; // Weight of vote
	}

	let { weight, decay = 52, ...props }: Props = $props();
	let { network } = getContext<UnicoveContext>('state');
	const precision = 10 ** network.chain.systemToken!.symbol.precision;

	const tokens = $derived(
		Asset.from(
			Number(weight) / calcVoteWeight(decay) / precision,
			network.chain.systemToken!.symbol
		)
	);

	function calcVoteWeight(voteDecayPeriod: number) {
		const timestamp = 946684800000;
		const dates = (Date.now() - timestamp) / 1000;
		const weight = Math.floor(dates / (86400 * 7)) / voteDecayPeriod;
		return 2 ** weight;
	}
</script>

<AssetText {...props} value={tokens} />
