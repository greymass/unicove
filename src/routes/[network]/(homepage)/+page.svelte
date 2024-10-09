<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Button from '$lib/components/button/button.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
</script>

<Stack>
	<Pageheader title={data.network.chain.name} />

	{#if context.account}
		<Pageheader title="My Account" subtitle="An account overview" />
		<Card>Information about the currently logged in account</Card>
		<Button href="/{data.network}/account/{context.account.name}">My Account</Button>
	{:else}
		<Pageheader title="Getting started" subtitle="Login or create an acount" />
		<Card>Controls and information about either creating an account or logging in</Card>
	{/if}

	<Pageheader
		title="{data.network.chain.systemToken?.symbol.name} Token"
		subtitle="System Token Overview"
	/>
	<Card>Token Chart and Information</Card>

	<Pageheader title="Staking" subtitle="Staking Overview" />
	<Card>Staking Chart and Information</Card>
	<Button href="/{data.network}/staking">Staking</Button>

	<Pageheader title="RAM" subtitle="RAM Overview" />
	<Card>RAM Chart and Information</Card>
	<Button href="/{data.network}/ram">RAM Market</Button>

	<Pageheader title="Network" subtitle="Network Overview" />
	<Card>Network charts/metrics</Card>
	<Button href="/{data.network}/network">Network</Button>
</Stack>
