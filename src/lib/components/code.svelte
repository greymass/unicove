<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	interface CodeProps {
		json?: unknown;
		inline?: boolean;
		children?: Snippet;
		class?: string;
		collapsible?: boolean;
		indent?: number;
	}
	const { indent = 2, collapsible = false, ...props }: CodeProps = $props();

	let collapsed = $state<boolean>(false);

	const collapseThreshold = 220;

	let node = $state<HTMLElement>();

	$effect(() => {
		if (node && collapsible && node.offsetHeight > collapseThreshold) {
			collapsed = true;
		}
	});

	function expandNode() {
		if (node) {
			collapsed = false;
			node.classList.add('max-h-full');
		}
	}
</script>

{#if props.inline}
	<code
		class={cn('bg-shark-900/40 rounded-md px-2 py-1 font-mono text-xs text-white', props.class)}
	>
		{#if props.json}
			{JSON.stringify(props.json, undefined, indent)}
		{:else if props.children}
			{@render props.children()}
		{/if}
	</code>
{:else}
	<div
		bind:this={node}
		class={cn(
			'bg-shark-900/20 relative overflow-x-auto overflow-y-hidden rounded-xl p-6 font-mono text-sm text-white',
			collapsible ? 'max-h-56' : 'max-h-full',
			props.class
		)}
	>
		{#if collapsed}
			<button
				class="from-shark-950 absolute inset-0 top-0 left-0 flex cursor-pointer items-end justify-center bg-linear-to-t to-transparent to-40% pb-4 font-sans font-semibold"
				onclick={expandNode}
			>
				{m.common_more()}
			</button>
		{/if}
		{#if props.json}
			<pre><code>{JSON.stringify(props.json, undefined, indent)}</code></pre>
		{:else if props.children}
			<pre><code>{@render props.children()}</code></pre>
		{/if}
	</div>
{/if}
