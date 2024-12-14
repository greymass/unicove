<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { children, data } = $props();

	const options = $derived.by(() => {
		const account = String(data.account.name);
		const network = String(data.account.network);
		let items = [
			{ href: `/${network}/account/${account}`, text: 'Overview' },
			{ href: `/${network}/account/${account}/activity`, text: 'Activity' },
			{ href: `/${network}/account/${account}/balances`, text: 'Balances' }
		];

		if (context.settings.data.advancedMode) {
			items.push({ href: `/${network}/account/${account}/permissions`, text: 'Permissions' });
			items.push({ href: `/${network}/account/${account}/votes`, text: 'Votes' });

			if (data.account.proposals.length > 0) {
				items.push({ href: `/${network}/account/${account}/proposals`, text: 'Proposals' });
			}
		}

		if (context.settings.data.debugMode) {
			items.push({ href: `/${network}/account/${account}/ram`, text: 'RAM' });
			items.push({ href: `/${network}/account/${account}/resources`, text: 'Resources' });
			items.push({ href: `/${network}/account/${account}/staked`, text: 'Staked' });
			items.push({ href: `/${network}/account/${account}/chaindata`, text: 'Data' });
		}

		return items;
	});
</script>

<Stack class="gap-6 @container">
	<PillGroup {options} />

	{@render children()}
</Stack>
