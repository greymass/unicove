<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Name } from '@wharfkit/antelope';
	import { getContext, type Snippet } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	interface Props {
		children?: Snippet;
		name?: Name | string;
	}

	let { name, children }: Props = $props();
</script>

{#if name}
	<a class="text-skyBlue-500 hover:text-skyBlue-400" href="/{network}/contract/{String(name)}">
		{#if children}
			{@render children()}
		{:else}
			{String(name)}
		{/if}
	</a>
{/if}
