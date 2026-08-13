<script lang="ts">
	import { Card, Stack } from 'unicove-components';
	import { page } from '$app/state';
	import { formatDateTime } from '$lib/utils/intl';
	import { parseVpDate } from '$lib/vp/dates';
	import { VP_BRANCH, vpHistoryUrl } from '$lib/vp/links';
	import type { VpRevision } from '$lib/vp/revisions';

	interface Props {
		revisions: VpRevision[];
		slug: string;
		branch?: string;
	}

	const { revisions, slug, branch = VP_BRANCH }: Props = $props();
	const locale = $derived(page.params.locale ?? 'en');
	const formatDate = (value: string) =>
		formatDateTime(parseVpDate(value), locale, { dateStyle: 'medium', timeStyle: undefined });
</script>

{#if revisions.length}
	<Card>
		<h2 class="text-label-sm text-muted mb-3">Revision history</h2>
		<Stack class="gap-3">
			{#each revisions as revision (revision.version)}
				<div>
					<div class="text-sm font-medium">
						Version {revision.version} · {formatDate(revision.date)}
					</div>
					<div class="text-muted text-sm">{revision.summary}</div>
				</div>
			{/each}
		</Stack>
		<a
			class="text-primary mt-3 inline-block text-sm hover:underline"
			href={vpHistoryUrl(slug, branch)}
			rel="noopener noreferrer"
			target="_blank"
		>
			Change history
		</a>
	</Card>
{/if}
