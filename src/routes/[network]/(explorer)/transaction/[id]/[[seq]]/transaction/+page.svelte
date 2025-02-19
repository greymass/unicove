<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="p-2">
	<h2 class="h2 text-2xl">Transaction</h2>
	<p>The raw transaction as it was performed.</p>
</div>

<Code>
	{JSON.stringify(data.transaction.transaction, null, 2)}
</Code>
