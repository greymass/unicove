<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TokenPair } from '$lib/types/token';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		value: TokenPair;
	}

	let { value: pair, ...props }: Props = $props();
</script>

<span class={props.class}>
	<AssetText value={pair.price} />
	{pair.base.symbol.code}/{pair.quote.symbol.code}
</span>
