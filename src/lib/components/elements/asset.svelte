<script lang="ts">
	import type { Asset } from '@wharfkit/antelope';
	import type { HTMLAttributes } from 'svelte/elements';

	interface AssetProps extends HTMLAttributes<HTMLSpanElement> {
		value?: Asset;
		variant?: 'value' | 'quantity' | 'full';
		fallback?: string;
	}

	let {
		class: className = '',
		value,
		variant = 'value',
		fallback = '0',
		...props
	}: AssetProps = $props();
</script>

<span class={className} {...props}>
	{#if variant === 'full'}
		{value ? `${value.quantity} ${value.symbol.name}` : fallback}
	{:else}
		{value?.value || fallback}
	{/if}
</span>
