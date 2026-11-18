<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import {
		KIND_COLORS,
		ORIGIN_KINDS,
		kindCount,
		type OriginTotals
	} from '$lib/state/creationindex/origins';
	import { formatNumber } from '$lib/utils/intl';
	import { kindLabel } from './labels.svelte';

	interface Props {
		totals: OriginTotals;
		class?: string;
	}

	let { totals, class: className = 'h-2' }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	const parts = $derived(
		ORIGIN_KINDS.map((kind) => ({ kind, count: kindCount(totals, kind) })).filter(
			(part) => part.count > 0
		)
	);
	const sum = $derived(parts.reduce((total, part) => total + part.count, 0) || 1);
</script>

<div class="flex w-full overflow-hidden rounded-full {className}">
	{#each parts as part (part.kind)}
		<span
			title="{kindLabel(part.kind)}: {formatNumber(part.count, locale)}"
			style:width="{(part.count / sum) * 100}%"
			style:background={KIND_COLORS[part.kind]}
		></span>
	{/each}
</div>
