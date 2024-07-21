<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { user } from '$lib/wharf/user.svelte';

	export let data: PageData;

	async function test() {
		if (user.contracts.token && user.session) {
			const action = user.contracts.token.action('transfer', {
				from: user.session.actor,
				to: 'teamgreymass',
				quantity: '0.0001 EOS',
				memo: 'test'
			});
			user.session.transact({ action });
		} else {
			alert('Not logged in');
		}
	}
</script>

{#if user.session}
	<h1>Send/Receive: {user.session.actor}</h1>
{/if}

{#if user.account}
	<p>{user.account.data.core_liquid_balance}</p>
	<button onclick={test}>Send 0.0001 test</button>
	<pre>{JSON.stringify(user.account.data, null, 2)}</pre>
{/if}
