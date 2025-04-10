<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Int } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	let { number }: { number?: Int | number | string } = $props();
</script>

{#if number}
	<a class="text-primary hover:text-primary-container" href="/{network}/block/{String(number)}">
		{String(number)}
	</a>
{/if}
