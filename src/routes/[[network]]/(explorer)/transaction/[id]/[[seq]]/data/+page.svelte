<script lang="ts">
	import type { PageData } from '../../data/$types';
	import * as m from '$lib/paraglide/messages.js';

	export let data: PageData;
</script>

<p>Data</p>

<pre>
{JSON.stringify(data.transaction, null, 2)}
</pre>
