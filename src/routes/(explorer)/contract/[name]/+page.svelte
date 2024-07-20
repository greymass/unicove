<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	export let data: PageData;
</script>

<h1>Contract: {data.name}</h1>

<pre>
{JSON.stringify(data.abi, null, 2)}
</pre>
