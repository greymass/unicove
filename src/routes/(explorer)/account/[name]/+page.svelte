<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import AccountLink from '$lib/components/link/account.svelte';

	export let data: PageData;
</script>

<h1>{data.name}</h1>

<AccountLink contract name={data.name}>View Contract</AccountLink>

<pre>
{JSON.stringify(data.account, null, 2)}
</pre>
