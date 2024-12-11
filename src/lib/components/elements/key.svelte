<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { PrivateKey, PublicKey } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	let { key }: { key?: PublicKey | PrivateKey | string } = $props();
</script>

{#if key}
	<a class="text-skyBlue-500 hover:text-skyBlue-400" href="/{network}/key/{String(key)}">
		{String(key)}
	</a>
{/if}
