<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const { data } = $props();
</script>

<Stack>
	<Code>{JSON.stringify(data.abi, null, 2)}</Code>
</Stack>
