<script lang="ts">
	import { languageTag } from '$lib/paraglide/runtime';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	const context = getContext<UnicoveContext>('state');

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		value: Asset | undefined;
	}

	let { value: asset, ...props }: Props = $props();

	const locale = languageTag();

	const options: Intl.NumberFormatOptions = {
		style: 'decimal',
		minimumFractionDigits: asset?.symbol.precision
	};

	let formattedValue = $derived(Intl.NumberFormat(locale, options).format(asset?.value || 0));

	let baseCode = $derived(context.network?.chain.systemToken?.symbol.code);
	let quoteCode = $derived(asset?.symbol.code);
</script>

<span class={props.class}>{formattedValue} {baseCode}/{quoteCode}</span>
