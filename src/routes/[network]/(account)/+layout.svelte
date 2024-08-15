<script lang="ts">
	import { PageMargin } from '$lib/components/layout';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';
	import { page } from '$app/stores';

	const { children, data } = $props();

	const destinations = $derived.by(() => {
		const network = String(data.network);
		return [
			{ href: `/${network}/account`, text: 'Account' },
			{ href: `/${network}/move`, text: 'Move' },
			{ href: `/${network}/permissions`, text: 'Permissions' },
			{ href: `/${network}/ram`, text: 'RAM' },
			{ href: `/${network}/resources`, text: 'Resources' },
			{ href: `/${network}/send`, text: 'Send' },
			{ href: `/${network}/transactions`, text: 'Transactions' },
			{ href: `/${network}/vote`, text: 'Vote' }
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
