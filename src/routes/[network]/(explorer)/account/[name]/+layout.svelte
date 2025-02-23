<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import * as m from '$lib/paraglide/messages';
	import dayjs from 'dayjs';

	const context = getContext<UnicoveContext>('state');
	const { children, data } = $props();

	const options = $derived.by(() => {
		const account = String(data.account.name);
		const network = String(data.account.network);
		let items = [
			{ href: `/${network}/account/${account}`, text: m.navigation_overview() },
			{ href: `/${network}/account/${account}/activity`, text: m.navigation_activity() },
			{ href: `/${network}/account/${account}/balances`, text: m.navigation_balances() }
		];

		if (context.settings.data.advancedMode) {
			items.push({
				href: `/${network}/account/${account}/permissions`,
				text: m.navigation_permissions()
			});
			items.push({ href: `/${network}/account/${account}/votes`, text: m.navigation_votes() });
			if (data.account.proposals.length > 0) {
				items.push({
					href: `/${network}/account/${account}/proposals`,
					text: m.navigation_proposals({
						number: data.account.proposals.length
					})
				});
			}
			items.push({ href: `/${network}/account/${account}/authority`, text: 'Authority' });

			items.push({ href: `/${network}/account/${account}/data`, text: m.common_data() });
		}

		if (context.settings.data.debugMode) {
			items.push({ href: `/${network}/account/${account}/ram`, text: 'RAM' });
			items.push({
				href: `/${network}/account/${account}/resources`,
				text: m.navigation_resources()
			});
			items.push({ href: `/${network}/account/${account}/staked`, text: m.navigation_staked() });
			items.push({ href: `/${network}/account/${account}/chaindata`, text: m.common_data() });
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
		}, 100000);
	});

	onDestroy(() => {
		clearInterval(updated);
		clearInterval(refresh);
	});
</script>

<Stack class="gap-6 @container">
	<PillGroup {options} />
	{@render children()}
</Stack>

{#if context.settings.data.debugMode}
	<div class="text-muted text-center text-sm">
		Account updated {lastUpdate} seconds ago
	</div>
{/if}
