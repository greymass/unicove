<script lang="ts">
	import TransactionRAM from '$lib/components/transaction/ram.svelte';

	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="p-2">
	<h2 class="text-headline text-2xl">{m.common_ram_usage()}</h2>
	<p>{m.common_ram_usage_description()}</p>
</div>

<TransactionRAM traces={data.transaction.traces} />
