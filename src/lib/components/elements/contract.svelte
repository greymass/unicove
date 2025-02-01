<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { cn } from '$lib/utils';
	import type { Name } from '@wharfkit/antelope';
	import { getContext, type Snippet } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	interface Props {
		children?: Snippet;
		name?: Name | string;
		action?: Name | string;
		struct?: Name;
		class?: string;
	}

	let { name, action, struct, children, ...props }: Props = $props();

	let href = $derived.by(() => {
		const base = `/${network}/contract/${String(name)}`;
		if (action) {
			return base + `/actions/${action}`;
		}
		if (struct) {
			return base + `/structs/${struct}`;
		}
		return base;
	});
</script>

{#if name}
	<a class={cn('text-skyBlue-500 hover:text-skyBlue-400', props.class)} {href}>
		{#if children}
			{@render children()}
		{:else}
			{String(name)}
		{/if}
	</a>
{/if}
