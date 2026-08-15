<!-- .../proposals/[vp]/revisions/+page.svelte -->
<script lang="ts">
	import { Card, Stack } from 'unicove-components';
	import { page } from '$app/state';
	import { formatDateTime } from '$lib/utils/intl';
	import { parseVpDate } from '$lib/vp/dates';
	import { vpHistoryUrl, vpSourceUrl } from '$lib/vp/links';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const locale = $derived(page.params.locale ?? 'en');
	const formatDate = (value: string) =>
		formatDateTime(parseVpDate(value), locale, { dateStyle: 'medium', timeStyle: undefined });
	const current = $derived(data.revisions.length ? data.revisions[0].version : null);
</script>

<Stack class="max-w-[70ch] gap-8">
	{#if data.revisions.length}
		<Stack class="gap-3">
			<h2 class="text-label-sm text-muted">Revisions</h2>
			{#each data.revisions as revision (revision.version)}
				<Card>
					<div class="flex flex-wrap items-baseline justify-between gap-2">
						<span class="font-medium">Version {revision.version}</span>
						<span class="text-muted text-sm">
							{formatDate(revision.date)}{revision.version === current ? ' · current' : ''}
						</span>
					</div>
					<p class="text-muted text-sm">{revision.summary}</p>
				</Card>
			{/each}
		</Stack>
	{:else}
		<p class="text-muted text-sm">This proposal has no recorded revisions.</p>
	{/if}

	{#if data.summary.translations.length}
		<Stack class="gap-3">
			<h2 class="text-label-sm text-muted">Translations</h2>
			<Card>
				<Stack class="gap-2">
					{#each data.summary.translations as translation (translation.lang)}
						<div class="flex items-baseline justify-between gap-2 text-sm">
							<span>{translation.lang}</span>
							<span class="text-muted">
								{translation.current ? 'Current' : 'Behind the English text'}
							</span>
						</div>
					{/each}
				</Stack>
			</Card>
		</Stack>
	{/if}

	<div class="flex flex-wrap gap-4 text-sm">
		<a
			class="text-primary hover:underline"
			href={vpHistoryUrl(data.summary.slug, data.branch)}
			rel="noopener noreferrer"
			target="_blank">Change history</a
		>
		<a
			class="text-primary hover:underline"
			href={vpSourceUrl(data.summary.slug, data.branch)}
			rel="noopener noreferrer"
			target="_blank">View source on GitHub</a
		>
	</div>
</Stack>
