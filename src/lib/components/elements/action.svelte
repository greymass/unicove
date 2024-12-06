<script lang="ts">
	import Code from '../code.svelte';

	interface Props {
		data: Record<string, unknown>;
	}

	let props: Props = $props();
</script>

{#if props.data}
	<Code>{JSON.stringify(props.data, null, 2)}</Code>
{/if}
