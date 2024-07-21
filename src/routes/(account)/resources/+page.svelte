<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { user } from '$lib/wharf/user.svelte';

	export let data: PageData;
</script>

{#if user.session}
	<h1>Resources: {user.session.actor}</h1>
{/if}

{#if user.account}
	<pre>{JSON.stringify(user.account.data, null, 2)}</pre>
{/if}
