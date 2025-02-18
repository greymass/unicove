<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Checksum256Type } from '@wharfkit/antelope';
	import { truncateCenter } from '$lib/utils';
	import { getContext } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	let { id }: { id: Checksum256Type } = $props();

	const truncatedString = truncateCenter(String(id));
</script>

{#if id}
	<a class="text-skyBlue-500 hover:text-skyBlue-400" href="/{network}/transaction/{String(id)}">
		{truncatedString}
	</a>
{/if}
