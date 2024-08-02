<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
	const { wharf } = $derived(data);
</script>

<Button onclick={() => wharf.network.refresh()}>Update network state</Button>

<Code>
	{JSON.stringify(wharf.network, null, 2)}
</Code>
