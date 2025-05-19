<script lang="ts">
	import { formatNumber, type IntlNumberTypes } from '$lib/utils/intl';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		number: IntlNumberTypes;
		class?: string;
		prefix?: boolean;
	}

	let { number, class: className = '', prefix = false }: Props = $props();

	const symbol = $derived(Number(number) > 0 ? '+' : '');
</script>

<span class={className}>
	{#if prefix}{symbol}{/if}{formatNumber(number, getLocale())}
</span>
