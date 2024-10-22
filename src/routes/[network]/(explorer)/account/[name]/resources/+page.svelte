<script lang="ts">
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

<div class="space-y-4">
	<h3 class="h3">RAM Prices</h3>
	<Code>{JSON.stringify(data.network.ramprice, null, 2)}</Code>

	{#if data.account}
		<h3 class="h3">RAM</h3>
		<Code>{JSON.stringify(data.account.ram, null, 2)}</Code>
		<h3 class="h3">CPU</h3>
		<Code>{JSON.stringify(data.account.cpu, null, 2)}</Code>
		<h3 class="h3">NET</h3>
		<Code>{JSON.stringify(data.account.net, null, 2)}</Code>
	{/if}
</div>
