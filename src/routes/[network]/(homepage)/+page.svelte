<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/button/button.svelte';
	import { Box, Center, Stack } from '$lib/components/layout';
	import { languageTag } from '$lib/paraglide/runtime';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
</script>

<Box>
	<Center>
		<Stack>
			<h2 class="h2">{data.network}</h2>

			<p>Language: {languageTag()}</p>
			<p>Test Localization String: {m.test_locale_string()}</p>

			<Button href="/{data.network}/debug/state/account">Application State</Button>
			<Button href="/{data.network}/debug/components">Component Library</Button>
			<Button href="/{data.network}/debug/input/asset">Asset Input</Button>

			<h3>{m.active_session()}</h3>
			{#if context.wharf.session}
				<p>Current: {context.wharf.session.actor}</p>
				<Button onclick={() => context.wharf.logout(context.wharf.session)}
					>Logout current account</Button
				>
				<Button onclick={() => context.wharf.logout()}>Logout all accounts</Button>
			{/if}

			<h3>Sessions</h3>
			<Button onclick={() => context.wharf.login({ chain: data.network.chain })}>Login</Button>
			{#each context.wharf.sessions as session}
				{#if data.network.chain.id.equals(session.chain)}
					<p>
						<Button onclick={() => context.wharf.switch(session)} variant="secondary">
							Switch: {session.actor}@{session.permission} ({session.chain})
						</Button>
					</p>
				{/if}
			{/each}
		</Stack>
	</Center>
</Box>
