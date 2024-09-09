<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Box, Center, Cluster, Stack } from '$lib/components/layout';
	import PageHeader from '$lib/components/pageheader.svelte';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';
	import { page } from '$app/stores';
	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import { getContext } from 'svelte';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return [
			{ href: `/${network}/staking`, text: 'Overview' },
			{ href: `/${network}/staking/stake`, text: 'Stake' },
			{ href: `/${network}/staking/unstake`, text: 'Unstake' },
			{ href: `/${network}/staking/withdraw`, text: 'Withdraw' }
		];
	});

	let currentTab = $derived($page.url.pathname.split('/').pop());
	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/').pop() === currentTab
		}))
	);
</script>

<Box>
	<Stack>
		<Cluster class="justify-between ">
			<PageHeader title="Staking" />
			<PillGroup {options} class="mb-6" />
		</Cluster>
	</Stack>

	{@render children()}
</Box>
