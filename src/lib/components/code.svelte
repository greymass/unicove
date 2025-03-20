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
	const preStyles = 'bg-shark-900/20 text-sm text-white font-mono rounded-lg px-2 py-2';
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
		<div class="overflow-x-auto rounded-sm bg-shark-950 p-4">
			{#if props.json}
				{JSON.stringify(props.json, undefined, 2)}
			{:else if props.children}
				{@render props.children()}
			{/if}
		</div>
	</svelte:element>
{/if}
