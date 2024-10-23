<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { children } = $props();
</script>

<Stack>
	<Pageheader title="Resources" />
	{@render children()}
</Stack>
