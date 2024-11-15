<script lang="ts">
	import type { Asset } from '@wharfkit/antelope';
	import type { HTMLAttributes } from 'svelte/elements';

	import { languageTag } from '$lib/paraglide/runtime.js';

	interface AssetProps extends HTMLAttributes<HTMLSpanElement> {
		value?: Asset;
		variant?: 'value' | 'full';
		fallback?: string;
	}

	let {
		class: className = '',
		value,
		variant = 'value',
		fallback = '0',
		...props
	}: AssetProps = $props();

	function formatAssetValue(value?: Asset) {
		if (value) {
			const [integerPart, decimalPart] = value.quantity.split('.');
			const bigInt = BigInt(integerPart);
			const formatInt = new Intl.NumberFormat(languageTag()).format(bigInt);
			return decimalPart ? `${formatInt}.${decimalPart}` : formatInt;
		} else {
			return fallback;
		}
	}
</script>

<span class={className} {...props}>
	{#if variant === 'full'}
		{value ? `${formatAssetValue(value)} ${value.symbol.name}` : fallback}
	{:else}
		{formatAssetValue(value)}
	{/if}
</span>
