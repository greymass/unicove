<script lang="ts">
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

{#if data.account}
	<div class="space-y-4">
		<h3 class="h3">Account Value</h3>
		<Code>{JSON.stringify(data.account.value, null, 2)}</Code>
		<h3 class="h3">System Token Balance</h3>
		<Code>{JSON.stringify(data.account.balance, null, 2)}</Code>
		<h3 class="h3">Token Price</h3>
		{#if data.account.network}
			<Code>{JSON.stringify(data.account.network.tokenprice, null, 2)}</Code>
		{/if}
		<h3 class="h3">RAM Balance</h3>
		<Code>{JSON.stringify(data.account.ram, null, 2)}</Code>
		{#if data.account.network}
			<h3 class="h3">RAM Prices</h3>
			<Code>{JSON.stringify(data.account.network.ramprice, null, 2)}</Code>
		{/if}
		<h3 class="h3">Balances</h3>
		<Code>{JSON.stringify(data.account.balances, null, 2)}</Code>
	</div>
{/if}

{#if data.account}
	<hr />
	<Code>{JSON.stringify(data.account.network, null, 2)}</Code>
	<Code>{JSON.stringify(data.account, null, 2)}</Code>
{/if}
