<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	export let data: PageData;
</script>

<h1>{data.proposer}/{data.proposer}</h1>

<pre>
{JSON.stringify(data.proposal, null, 2)}
</pre>
