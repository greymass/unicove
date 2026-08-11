<script lang="ts">
	import { Card, DD, DL, DLRow } from 'unicove-components';
	import { page } from '$app/state';
	import { formatDateTime } from '$lib/utils/intl';
	import { vpStandardUrl } from '$lib/vp/links';
	import VpStatusChip from './VpStatusChip.svelte';
	import type { VpSummary } from '$lib/vp/types';

	interface Props {
		summary: VpSummary;
	}

	const { summary }: Props = $props();
	const locale = $derived(page.params.locale ?? 'en');
	const formatDate = (value: string) =>
		formatDateTime(new Date(value), locale, { dateStyle: 'medium', timeStyle: undefined });
</script>

<Card>
	<h2 class="text-label-sm text-muted mb-3">Details</h2>
	<DL>
		<DLRow title="Status"><DD><VpStatusChip status={summary.status} /></DD></DLRow>
		<DLRow title="Created" description={formatDate(summary.created)} />
		{#if summary.updated}
			<DLRow title="Updated" description={formatDate(summary.updated)} />
		{/if}
		<DLRow title="Authors" description={summary.authors.join(', ')} />
		<DLRow title="Standard">
			<DD>
				<a
					class="text-primary hover:underline"
					href={vpStandardUrl(summary.standard)}
					rel="noopener noreferrer"
					target="_blank"
				>
					{summary.standard}
				</a>
			</DD>
		</DLRow>
	</DL>
</Card>
