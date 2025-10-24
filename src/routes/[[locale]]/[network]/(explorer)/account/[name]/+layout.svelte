<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import { Stack } from 'unicove-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import dayjs from 'dayjs';
	import { Button } from 'unicove-components';

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
			items.push({
				href: `/${network}/account/${account}/permissions`,
				text: 'Permissions'
			});
			items.push({ href: `/${network}/account/${account}/votes`, text: 'Votes' });
			if (data.account.proposals.length > 0) {
				items.push({
					href: `/${network}/account/${account}/proposals`,
					text: `Proposals (${data.account.proposals.length})`
				});
			}
			items.push({ href: `/${network}/account/${account}/authority`, text: 'Authority' });
			items.push({ href: `/${network}/account/${account}/data`, text: 'Data' });
		}

		if (context.settings.data.debugMode) {
			items.push({ href: `/${network}/account/${account}/ram`, text: 'RAM' });
			items.push({
				href: `/${network}/account/${account}/resources`,
				text: 'Resources'
			});
			items.push({ href: `/${network}/account/${account}/staked`, text: 'Staked' });
			items.push({ href: `/${network}/account/${account}/chaindata`, text: 'Data' });
		}

		return items;
	});

	let updated: ReturnType<typeof setInterval>;
	let lastUpdate = $state(0);
	let refresh: ReturnType<typeof setInterval>;
	onMount(() => {
		updated = setInterval(() => {
			const account = dayjs(data.account.last_update);
			const current = dayjs(new Date());
			lastUpdate = account.diff(current, 'seconds') * -1;
		}, 1000);
		refresh = setInterval(() => {
			data.account.refresh();
		}, 60000);
	});

	onDestroy(() => {
		clearInterval(updated);
		clearInterval(refresh);
	});
</script>

<Stack class="@container gap-6">
	<PillGroup {options} />
	{@render children()}
</Stack>

{#if context.settings.data.debugMode}
	<div class="text-muted text-center text-sm">
		props.account updated {lastUpdate} seconds ago
		<Button onclick={() => data.account.refresh()}>Refresh</Button>
	</div>
{/if}
