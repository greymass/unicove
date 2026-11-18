<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { KindFigures } from '$lib/state/creationindex/client';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatNumber } from '$lib/utils/intl';

	interface Props {
		figures: KindFigures;
	}

	let { figures }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const note =
		'Before system contracts v3.3.0 (March 2024) the chain stated only what was paid or requested, not the bytes delivered.';
</script>

{#if figures.bytes !== null}<span>{formatBytes(figures.bytes)}</span
	>{#if figures.without_bytes > 0}<span class="text-muted" title={note}
			>, plus {formatNumber(figures.without_bytes, locale)} with no byte count</span
		>{/if}{:else if figures.without_bytes > 0}<span class="text-muted" title={note}
		>Byte count not recorded</span
	>{/if}
