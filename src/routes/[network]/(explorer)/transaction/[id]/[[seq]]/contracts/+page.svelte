<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<p>Contracts ({data.transaction.contracts.length})</p>

<pre>
{JSON.stringify(data.transaction.contracts, null, 2)}
</pre>
