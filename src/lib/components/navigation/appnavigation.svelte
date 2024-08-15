<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Cluster, PageMargin } from '$lib/components/layout';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import AccountSelect from '$lib/components/select/account.svelte';

	const context = getContext<UnicoveContext>('state');

	const { network } = $props();
</script>

<PageMargin>
	<nav class="flex flex-wrap items-center justify-between gap-4">
		<a href="/">Home</a>
		{#if network}
			<a class="grow" href="/{network}">{network}</a>
		{/if}

		<Cluster tag="nav" class="items-center justify-end">
			{#if context.account}
				<a href={`/${String(context.account.network)}/account`}> My Actions </a>
				<a href={`/${String(context.account.network)}/account/${context.account.name}`}>
					My Account (Overview)
				</a>
			{/if}
			<LanguageSelect />
			<AccountSelect />
		</Cluster>
	</nav>
</PageMargin>
