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
		return Number(value?.quantity || fallback).toLocaleString(languageTag(), {
			minimumFractionDigits: value?.symbol.precision
		});
	}
</script>

<span class={className} {...props}>
	{#if variant === 'full'}
		{value ? `${formatAssetValue(value)} ${value.symbol.name}` : fallback}
	{:else}
		{formatAssetValue(value)}
	{/if}
</span>
