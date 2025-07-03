<script lang="ts">
	import {Code} from 'unicove-components';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages';
	import Stack from '$lib/components/layout/stack.svelte';

	export let data: PageData;
</script>

<Stack class="gap-8">
	<div class="space-y-2">
		<h2 class="h3">{m.common_transaction()}</h2>
		<Code json={data.transaction.transaction} />
	</div>
	<div class="space-y-2">
		<h2 class="h3">{m.common_signatures()}</h2>
		<Code json={data.transaction.signedTransaction.signatures} />
	</div>
</Stack>
