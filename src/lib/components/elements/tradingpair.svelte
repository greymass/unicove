<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { getContext } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Asset } from '@wharfkit/antelope';

	const context = getContext<UnicoveContext>('state');

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		value: Asset | undefined;
	}

	let { value: asset, ...props }: Props = $props();

	let baseCode = $derived(asset?.symbol.code);
	let quoteCode = $derived(context.network?.chain.systemToken?.symbol.code);
</script>

<span class={props.class}> <AssetText value={asset} /> {baseCode}/{quoteCode}</span>
