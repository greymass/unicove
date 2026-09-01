<script lang="ts">
	import { Code } from 'unicove-components';
	import type { PageData } from './$types';
	import { Stack } from 'unicove-components';

	const { data } = $props<{ data: PageData }>();
</script>

<Stack class="gap-8">
	<div class="space-y-2">
		<h2 class="text-title">Transaction</h2>
		<Code json={data.transaction.transaction} />
	</div>
	<div class="space-y-2">
		<h2 class="text-title">Signatures</h2>
		<Code json={data.transaction.signedTransaction.signatures} />
	</div>
</Stack>
