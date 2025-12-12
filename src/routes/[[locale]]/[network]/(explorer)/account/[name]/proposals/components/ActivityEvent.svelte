<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from 'unicove-components';
	import Link from '$lib/components/elements/link.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ActivityEvent } from '@wharfkit/msigs';
	import dayjs from 'dayjs';
	import relativeTimePlugin from 'dayjs/plugin/relativeTime';
	import { UserCheck, UserX, FilePlus, CheckCircle, XCircle } from '@lucide/svelte/icons';

	dayjs.extend(relativeTimePlugin);

	interface ActivityEventProps {
		event: ActivityEvent;
	}

	const { event }: ActivityEventProps = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const actionIcons = {
		proposed: FilePlus,
		approved: UserCheck,
		unapproved: UserX,
		executed: CheckCircle,
		cancelled: XCircle
	};

	const actionColors = {
		proposed: 'text-primary',
		approved: 'text-success',
		unapproved: 'text-warning',
		executed: 'text-success',
		cancelled: 'text-error'
	};

	const ActionIcon = $derived(actionIcons[event.action]);
	const actionColor = $derived(actionColors[event.action]);

	const timestamp = $derived(dayjs(String(event.timestamp)));
	const relativeTime = $derived(timestamp.fromNow());
	const absoluteTime = $derived(timestamp.format('MMM D, YYYY [at] h:mm A'));
</script>

<Card class="@container">
	<div class="flex items-start gap-4">
		<div class={`mt-1 ${actionColor}`}>
			<ActionIcon class="size-6" />
		</div>
		<div class="flex-1">
			<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<span class="font-medium capitalize">{event.action}</span>
						<Link
							href={urlPath(`/msig/${event.proposer}/${event.proposal_name}`)}
							class="text-primary hover:underline"
						>
							{String(event.proposal_name)}
						</Link>
					</div>
					<div class="text-muted text-sm">
						Proposed by
						<Link href={urlPath(`/account/${event.proposer}`)} class="hover:underline">
							{String(event.proposer)}
						</Link>
					</div>
				</div>
				<div class="text-muted flex flex-col text-sm sm:text-right">
					<span>{relativeTime}</span>
					<span class="text-xs">{absoluteTime}</span>
				</div>
			</div>
			<div class="text-muted mt-2 flex flex-wrap items-center gap-4 text-xs">
				<Link
					href={urlPath(`/transaction/${event.trx_id}`)}
					class="hover:text-on-surface hover:underline"
				>
					View Transaction
				</Link>
				<span>Block #{event.globalseq}</span>
			</div>
		</div>
	</div>
</Card>
