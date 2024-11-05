<script lang="ts">
	import { page } from '$app/stores';

	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import { i18n } from '$lib/i18n';

	const { data, children } = $props();
	const locale = i18n.getLanguageFromUrl($page.url);

	let currentTab = $derived($page.url.pathname.split('/')[4] || 'overview');
	const subtitle = $derived.by(() => {
		switch (currentTab) {
			case 'powerup':
			case 'rex':
			case 'stake':
				return 'Renting';
			default:
				return 'Overview';
		}
	});
	let backPath = $derived(
		currentTab === 'overview' ? undefined : `/${locale}/${data.network.shortname}/resources`
	);
</script>

<Stack>
	<Pageheader title="Resources" {subtitle} {backPath} />

	{@render children()}
</Stack>
