<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

{#if data.account}
	<div class="space-y-4">
		<h3 class="h3">Staked</h3>
		<h3 class="h3">Account Value</h3>
		<Code>{JSON.stringify(data.account.value, null, 2)}</Code>
		<h3 class="h3">System Token Balance</h3>
		<Code>{JSON.stringify(data.account.balance, null, 2)}</Code>
		<h3 class="h3">Token Price</h3>
		{#if data.account.network}
			<Code>{JSON.stringify(data.account.network.tokenprice, null, 2)}</Code>
		{/if}
		<h3 class="h3">REX State</h3>
		<Code>{JSON.stringify(data.account.network.rexstate, null, 2)}</Code>
	</div>
{/if}
