<script lang="ts">
	import { cn } from '$lib/utils/style';
	import { type AnyMeltElement, melt } from '@melt-ui/svelte';
	import { type Snippet } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	interface Props {
		variant: 'pill' | 'form';
		id: string;
		children: Snippet;
		open: Readable<boolean>;
		menu: AnyMeltElement;
		class?: string;
	}
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	const { class: className, menu, ...props }: Props = $props();
</script>

{#if props.open}
	<div
		data-theme={context.network}
		data-variant={props.variant}
		class={cn(
			'border-mine-600 bg-shark-950 z-90 flex max-h-[300px] flex-col overflow-y-auto border-2 py-1 shadow-sm focus:ring-0! data-[variant=form]:rounded-lg data-[variant=form]:px-2 data-[variant=form]:py-2 data-[variant=pill]:rounded-2xl data-[variant=pill]:px-1 data-[variant=pill]:py-1 ',
			className
		)}
		use:melt={$menu}
		transition:fade={{ duration: 100 }}
	>
		{@render props.children()}
	</div>
{/if}
