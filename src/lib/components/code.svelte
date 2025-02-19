<script lang="ts">
	const props = $props();
	const tag = props.inline ? 'code' : 'pre';

	const codeStyles = 'bg-shark-900/40 text-xs text-white font-mono rounded-md px-2 py-1';
	const preStyles = 'bg-shark-900/20 text-sm text-white font-mono rounded-lg px-2 py-2';
</script>

{#if props.inline}
	<svelte:element this={tag} class={codeStyles}>
		{@render props.children()}
	</svelte:element>
{:else}
	<svelte:element this={tag} class={preStyles}>
		<div class="overflow-x-auto rounded bg-shark-950 p-4">
			{@render props.children()}
		</div>
	</svelte:element>
{/if}
