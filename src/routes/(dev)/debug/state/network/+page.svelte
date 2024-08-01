<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

<Button onclick={() => data.network.refresh()}>Update network state</Button>

<Code>
	{JSON.stringify(data.network, null, 2)}
</Code>
