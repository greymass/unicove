<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<p>Transaction</p>

<pre>
{JSON.stringify(data.transaction.transaction, null, 2)}
</pre>
