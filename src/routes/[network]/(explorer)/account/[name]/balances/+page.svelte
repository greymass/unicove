<script lang="ts">
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

{#if data.account}
	<div class="space-y-4">
		<h3 class="h3">Balances</h3>
		<Code>{JSON.stringify(data.account.balances, null, 2)}</Code>
	</div>
{/if}
