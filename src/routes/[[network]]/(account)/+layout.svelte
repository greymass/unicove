<script lang="ts">
	import { PageMargin } from '$lib/components/layout';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';

	const { children, data } = $props();

	const context = getContext<UnicoveContext>('state');

	const destinations = $derived.by(() => {
		if (!context.account) return [];
		const name = String(context.account.name);
		const network = String(context.account.network);
		return [
			{ href: `/${network}/account/${name}`, text: 'Account' },
			{ href: `/${network}/permissions`, text: 'Permissions' },
			{ href: `/${network}/ram`, text: 'RAM' },
			{ href: `/${network}/resources`, text: 'Resources' },
			{ href: `/${network}/send`, text: 'Send' },
			{ href: `/${network}/transfer`, text: 'Transfer' },
			{ href: `/${network}/vote`, text: 'Vote' },
			{ href: `/${network}/transactions`, text: 'Transactions' }
		];
	});

	let rootPathname = $derived($page.url.pathname.split('/').slice(2)[1]);

	// Derive the active state of each destination
	let options = $derived(
		destinations.map((destination) => ({
			...destination,
			active: destination.href.includes(rootPathname)
		}))
	);
</script>

<AccountNavigation {options} />

<PageMargin>
	{@render children()}
</PageMargin>
