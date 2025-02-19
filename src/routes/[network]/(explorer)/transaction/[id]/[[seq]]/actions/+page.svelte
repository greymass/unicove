<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<p>Actions ({data.transaction.actions.length})</p>

<pre>
{JSON.stringify(data.transaction.actions, null, 2)}
</pre>
