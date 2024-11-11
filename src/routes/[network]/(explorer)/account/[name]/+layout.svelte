<script lang="ts">
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

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

<Stack class="gap-6">
	<PillGroup {options} />

	{@render children()}
</Stack>
