<script lang="ts">
	import {Code} from 'unicove-components';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="p-2">
	<h2 class="h2 text-2xl">Data</h2>
	<p>The raw data for the transaction.</p>
</div>

<Code>{JSON.stringify(data.transaction, null, 2)}</Code>
