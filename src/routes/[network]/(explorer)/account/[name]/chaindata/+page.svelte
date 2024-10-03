<script lang="ts">
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

<Code>{JSON.stringify(data.account, null, 2)}</Code>
