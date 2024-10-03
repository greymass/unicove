<script lang="ts">
	import { Box, Stack } from '$lib/components/layout';
	import PageHeader from '$lib/components/pageheader.svelte';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { page } from '$app/stores';

	const { children, data } = $props();

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
		<PageHeader title="Staking" />
		<PillGroup {options} class="mb-6" />
	</Stack>

	{@render children()}
</Box>
