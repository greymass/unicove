<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

{#if data.account}
	<div class="space-y-4">
		<h3 class="h3">RAM</h3>
		<Code>{JSON.stringify(data.account.ram, null, 2)}</Code>
		{#if data.account.network}
			<h3 class="h3">RAM Prices</h3>
			<Code>{JSON.stringify(data.account.network.ramprice, null, 2)}</Code>
		{/if}
		<h3 class="h3">Token Price</h3>
		{#if data.account.network}
			<Code>{JSON.stringify(data.account.network.tokenprice, null, 2)}</Code>
		{/if}
		<h3 class="h3">RAM State</h3>
		<Code>{JSON.stringify(data.account.network.ramstate, null, 2)}</Code>
	</div>
{/if}
