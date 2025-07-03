<script lang="ts">
	import {Code} from 'unicove-components';

	const { data } = $props();
</script>

<div class="space-y-4">
	<h3 class="h3">RAM Prices</h3>
	<Code>{JSON.stringify(data.network.resources.ram.price.rammarket, null, 2)}</Code>

	{#if data.account}
		<h3 class="h3">RAM</h3>
		<Code>{JSON.stringify(data.account.resources.ram, null, 2)}</Code>
		<h3 class="h3">CPU</h3>
		<Code>{JSON.stringify(data.account.resources.cpu, null, 2)}</Code>
		<h3 class="h3">NET</h3>
		<Code>{JSON.stringify(data.account.resources.net, null, 2)}</Code>
	{/if}
</div>
