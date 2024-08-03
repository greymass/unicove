<script lang="ts">
	const props = $props();
	const tag = props.inline ? 'code' : 'pre';

	const codeStyles = 'bg-shark-900/40 text-xs text-white font-mono rounded-md px-2 py-1';
	const preStyles =
		'bg-shark-900/20 text-sm text-white font-mono rounded-lg px-2 py-2 overflow-x-auto';
</script>

<svelte:element this={tag} class={props.inline ? codeStyles : preStyles}>
	{@render props.children()}
</svelte:element>
