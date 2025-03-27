<script lang="ts">
	import type { Snippet } from 'svelte';

	interface CodeProps {
		json?: unknown;
		inline?: boolean;
		children?: Snippet;
	}
	const props: CodeProps = $props();
	const tag = props.inline ? 'code' : 'pre';

	const codeStyles = 'bg-shark-900/40 text-xs text-white font-mono rounded-md px-2 py-1';
	const preStyles = 'bg-shark-950 p-6 text-sm text-white font-mono rounded-xl overflow-x-auto';
</script>

{#if props.inline}
	<svelte:element this={tag} class={codeStyles}>
		{#if props.json}
			{JSON.stringify(props.json, undefined, 2)}
		{:else if props.children}
			{@render props.children()}
		{/if}
	</svelte:element>
{:else}
	<svelte:element this={tag} class={preStyles}>
		{#if props.json}
			{JSON.stringify(props.json, undefined, 2)}
		{:else if props.children}
			{@render props.children()}
		{/if}
	</svelte:element>
{/if}
