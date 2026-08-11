<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from 'unicove-components';
	import { page } from '$app/state';
	import { localizePath } from '$lib/utils/url';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { vpSourceUrl } from '$lib/vp/links';
	import VpMarkdown from '$lib/components/vp/VpMarkdown.svelte';
	import VpOnchain from '$lib/components/vp/VpOnchain.svelte';
	import VpLanguageNav from '$lib/components/vp/VpLanguageNav.svelte';
	import VpDetailsCard from '$lib/components/vp/VpDetailsCard.svelte';
	import VpRelatedAccounts from '$lib/components/vp/VpRelatedAccounts.svelte';
	import VpStaleNotice from '$lib/components/vp/VpStaleNotice.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const basePath = $derived(urlPath('/proposals'));
	const englishHref = $derived(localizePath(page.url.pathname, { forceLocale: 'en' }));
</script>

<Stack class="gap-6">
	<VpLanguageNav summary={data.summary} current={data.lang} />

	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<Stack class="max-w-[70ch] min-w-0 gap-6">
			{#if data.stale}
				<VpStaleNotice {englishHref} />
			{/if}
			<VpMarkdown body={data.body} slug={data.summary.slug} {basePath} />
		</Stack>

		<Stack tag="aside" class="gap-4 self-start">
			<VpDetailsCard summary={data.summary} />
			<VpOnchain summary={data.summary} />
			<VpRelatedAccounts accounts={data.summary.accounts} />
			<a
				class="text-muted hover:text-on-surface text-sm hover:underline"
				href={vpSourceUrl(data.summary.slug)}
				rel="noopener noreferrer"
				target="_blank"
			>
				View source on GitHub
			</a>
		</Stack>
	</div>
</Stack>
