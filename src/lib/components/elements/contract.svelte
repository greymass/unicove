<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Name } from '@wharfkit/antelope';
	import { getContext, type Snippet } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	interface Props {
		children?: Snippet;
		name?: Name | string;
		action?: Name | string;
	}

	let { name, action, children }: Props = $props();

	let href = $derived.by(() => {
		const base = `/${network}/contract/${String(name)}`;
		if (action) {
			return base + `/actions/${action}`;
		}
		return base;
	});
</script>

{#if name}
	<a class="text-skyBlue-500 hover:text-skyBlue-400" {href}>
		{#if children}
			{@render children()}
		{:else}
			{String(name)}
		{/if}
	</a>
{/if}
