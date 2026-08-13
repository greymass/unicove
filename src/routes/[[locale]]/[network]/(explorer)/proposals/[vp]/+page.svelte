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
	import VpActions from '$lib/components/vp/VpActions.svelte';
	import VpDetailsCard from '$lib/components/vp/VpDetailsCard.svelte';
	import VpRevisions from '$lib/components/vp/VpRevisions.svelte';
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

	<VpActions summary={data.summary} />

	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<Stack class="max-w-[70ch] min-w-0 gap-6">
			{#if data.stale}
				<VpStaleNotice {englishHref} />
			{/if}
			<VpMarkdown body={data.body} slug={data.summary.slug} {basePath} branch={data.branch} />
		</Stack>

		<Stack tag="aside" class="gap-6 self-start">
			<Stack class="gap-4">
				<h2 class="text-label-sm text-muted">Proposal</h2>
				<VpDetailsCard summary={data.summary} revisions={data.revisions} branch={data.branch} />
				<VpRevisions revisions={data.revisions} slug={data.summary.slug} branch={data.branch} />
				<a
					class="text-muted hover:text-on-surface text-sm hover:underline"
					href={vpSourceUrl(data.summary.slug, data.branch)}
					rel="noopener noreferrer"
					target="_blank"
				>
					View source on GitHub
				</a>
			</Stack>
			<VpOnchain summary={data.summary} />
		</Stack>
	</div>
</Stack>
