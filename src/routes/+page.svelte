<script>
	import * as m from '$lib/paraglide/messages.js';
	import Language from '$lib/components/language.svelte';
	import { wharf } from '$lib/wharf/service.svelte';

	import { createCollapsible, melt } from '@melt-ui/svelte';
	const {
		elements: { root, content, trigger },
		states: { open }
	} = createCollapsible();
</script>

<div use:melt={$root}>
	<button use:melt={$trigger}>{$open ? 'Close' : 'Open'}</button>
	<div use:melt={$content}>Obi-Wan says: Hello there!</div>
</div>

<Language />

<a href="/debug/input/asset">Asset Input</a>

<h3>{m.active_session()}</h3>
{#if wharf}
	{#if wharf.session}
		<p>Current: {wharf.session.actor}</p>
		<button onclick={() => wharf.logout(wharf.session)}>Logout current account</button>
		<button onclick={() => wharf.logout()}>Logout all accounts</button>
	{/if}

	<h3>Sessions</h3>
	<button onclick={() => wharf.login()}>Login</button>
	{#each wharf.sessions as session}
		<p>
			<button onclick={() => wharf.switch(session)}>
				Switch: {session.actor}@{session.permission} ({session.chain})
			</button>
		</p>
	{/each}
{/if}
