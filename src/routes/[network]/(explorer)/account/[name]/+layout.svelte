<script lang="ts">
	import { page } from '$app/stores';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { children, data } = $props();

	const tabOptions = $derived.by(() => {
		const account = String(data.account.name);
		const network = String(data.account.network);
		return [
			{ href: `/${network}/account/${account}`, text: 'Overview' },
			{ href: `/${network}/account/${account}/activity`, text: 'Activity' },
			{ href: `/${network}/account/${account}/balances`, text: 'Balances' },
			// { href: `/${network}/account/${account}/permissions`, text: 'Permissions' },
			// { href: `/${network}/account/${account}/ram`, text: 'RAM' },
			// { href: `/${network}/account/${account}/resources`, text: 'Resources' },
			// { href: `/${network}/account/${account}/staked`, text: 'Staked' },
			{ href: `/${network}/account/${account}/chaindata`, text: 'Data' }
		];
	});

	let currentTab = $derived($page.url.pathname.split('/').slice(2)[3]);

	// Derive the active state of each destination
	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/').slice(2)[2] === currentTab
		}))
	);
</script>

<header class="layout-stack gap-6">
	<Pageheader title="Account" subtitle={String(data.account.name)} inverted />
	<PillGroup {options} class="mb-6" />
</header>

{@render children()}
