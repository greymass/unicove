<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	let { number }: { number?: number | string } = $props();
</script>

{#if number}
	<a class="text-skyBlue-500 hover:text-skyBlue-400" href="/{network}/block/{String(number)}">
		{String(number)}
	</a>
{/if}
