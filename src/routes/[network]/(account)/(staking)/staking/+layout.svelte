<script lang="ts">
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';
	import Pageheader from '$lib/components/pageheader.svelte';
	import { i18n } from '$lib/i18n';

	const { children, data } = $props();

	const locale = i18n.getLanguageFromUrl($page.url);

	let currentTab = $derived($page.url.pathname.split('/')[4] || 'overview');

	const subtitle = $derived.by(() => {
		switch (currentTab) {
			case 'stake':
				return 'Select amount to stake';
			case 'unstake':
				return 'Select amount to unstake';
			case 'withdraw':
				return 'Withdraw';
			default:
				return 'Overview';
		}
	});

	let backPath = $derived(
		currentTab === 'overview' ? undefined : `/${locale}/${data.network.shortname}/staking`
	);
</script>

<Stack tag="article" class="gap-6">
	<Pageheader title="Staking" {subtitle} {backPath} />

	{@render children()}
</Stack>
