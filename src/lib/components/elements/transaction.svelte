<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Checksum256Type } from '@wharfkit/antelope';
	import { truncateCenter } from '$lib/utils';
	import { getContext } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	let { id, class: className }: { id: Checksum256Type; class?: string } = $props();

	const truncatedString = truncateCenter(String(id));
</script>

{#if id}
	<a
		class="text-sky-500 hover:text-sky-400 {className}"
		href="/{network}/transaction/{String(id)}"
	>
		{truncatedString}
	</a>
{/if}
