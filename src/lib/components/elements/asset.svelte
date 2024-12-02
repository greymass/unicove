<script lang="ts">
	import type { Asset } from '@wharfkit/antelope';
	import type { HTMLAttributes } from 'svelte/elements';

	import { languageTag } from '$lib/paraglide/runtime.js';
	import { cn } from '$lib/utils';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	interface AssetProps extends HTMLAttributes<HTMLSpanElement> {
		value?: Asset;
		variant?: 'value' | 'full';
		fallback?: number;
	}

	let { value: asset, variant = 'value', fallback = 0, ...props }: AssetProps = $props();

	// TODO: Move somewhere else.
	const SUPPORTED_CURRENCIES = ['USD'];

	const locale = languageTag();

	const assetOptions: Intl.NumberFormatOptions = {
		minimumFractionDigits: asset?.symbol.precision
	};

	const currencyOptions: Intl.NumberFormatOptions = {
		style: 'currency',
		currency: asset?.symbol.name,
		currencyDisplay: 'narrowSymbol',
		minimumFractionDigits: context.settings.data.advancedMode ? asset?.symbol.precision : undefined
	};

	function formatAssetValue() {
		return Intl.NumberFormat(locale, assetOptions).format(asset?.value || fallback);
	}

	function formatCurrencyValue() {
		return Intl.NumberFormat(locale, currencyOptions).format(asset?.value || fallback);
	}

	const isCurrency = SUPPORTED_CURRENCIES.includes(String(asset?.symbol.name));
</script>

{#snippet span(string: string)}
	<span class={cn('text-right tabular-nums', props.class)} {...props}>{string}</span>
{/snippet}

{#if isCurrency && variant === 'value'}
	{@render span(formatCurrencyValue())}
{:else if isCurrency && variant === 'full'}
	{@render span(`${formatCurrencyValue()} ${asset?.symbol.name}`)}
{:else if !isCurrency && variant === 'value'}
	{@render span(formatAssetValue())}
{:else if !isCurrency && variant === 'full'}
	{@render span(`${formatAssetValue()} ${asset?.symbol.name}`)}
{/if}
