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
			node.classList.replace('overflow-x-auto', 'overflow-x-hidden');
		}
	});

	function expandNode() {
		if (node) {
			collapsed = false;
			node.classList.replace('max-h-56', 'max-h-full');
			node.classList.replace('overflow-x-hidden', 'overflow-x-auto');
		}
	}
</script>

{#if props.inline}
	<code
		class={cn(
			'bg-surface-container-high text-on-surface rounded-md px-2 py-1 font-mono text-xs',
			props.class
		)}
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
			'bg-surface-container-low text-on-surface relative overflow-x-auto overflow-y-hidden rounded-xl p-6 font-mono text-sm',
			collapsible ? 'max-h-56' : 'max-h-full ',
			props.class
		)}
	>
		{#if collapsed}
			<button
				class="from-surface-container-low group absolute inset-0 top-0 left-0 flex cursor-pointer items-end justify-center bg-linear-to-t to-transparent to-40% pb-4 font-sans font-semibold"
				onclick={expandNode}
			>
				<span class="group-hover:bg-surface-container-high rounded-full bg-transparent px-4 py-2">
					{m.common_more()}
				</span>
			</button>
		{/if}
		{#if props.json}
			<pre><code>{JSON.stringify(props.json, undefined, indent)}</code></pre>
		{:else if props.children}
			<pre><code>{@render props.children()}</code></pre>
		{/if}
	</div>
{/if}
