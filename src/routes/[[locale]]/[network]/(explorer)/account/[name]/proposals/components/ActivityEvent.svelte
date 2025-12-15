<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, cn } from 'unicove-components';
	import Link from '$lib/components/elements/link.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ActivityEvent } from '@wharfkit/msigs';
	import dayjs from 'dayjs';
	import { FilePlus, XCircle, BadgeCheck, CirclePlay, BadgeX } from '@lucide/svelte/icons';
	import Block from '$lib/components/elements/block.svelte';
	import Transaction from '$lib/components/elements/transaction.svelte';

	interface ActivityEventProps {
		event: ActivityEvent;
	}

	const { event }: ActivityEventProps = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const actionIcons = {
		proposed: FilePlus,
		approved: BadgeCheck,
		unapproved: BadgeX,
		executed: CirclePlay,
		cancelled: XCircle
	};

	const actionColors = {
		proposed: 'text-on-primary bg-primary',
		approved: 'text-on-success bg-success',
		unapproved: 'text-on-warning bg-warning',
		executed: 'text-success',
		cancelled: 'text-error'
	};

	const ActionIcon = $derived(actionIcons[event.action]);
	const actionColor = $derived(actionColors[event.action]);

	const timestamp = $derived(dayjs(String(event.timestamp)));
	const relativeTime = $derived(timestamp.fromNow());
	const absoluteTime = $derived(timestamp.format('MMM D, YYYY [at] h:mm A'));
</script>

<div class="group relative grid grid-cols-[auto_1fr] gap-6">
	<div class="relative grid h-full place-items-center *:col-start-1 *:row-start-1">
		<!-- Line -->
		<div
			class="border-surface-container-high h-full -translate-y-1/2 border border-2 border-l group-first:hidden"
		></div>

		<picture
			class={cn(
				' bg-surface-container-high z-10 grid size-12 place-items-center rounded-full',
				actionColor
			)}
		>
			<ActionIcon />
		</picture>
	</div>

	<Card class="@container">
		<div class="grid gap-4 @2xl:grid-cols-4">
			<hgroup class="flex flex-col gap-2">
				<h3 class="text-title">
					<span class="capitalize">{event.action}</span>
					<a
						href={urlPath(`/msig/${event.proposer}/${event.proposal_name}`)}
						class="text-primary hover:underline"
					>
						{String(event.proposal_name)}
					</a>
				</h3>

				<p class="text-label-sm text-muted">
					Proposed by
					<Account name={event.proposer}>
						{String(event.proposer)}
					</Account>
				</p>
			</hgroup>

			<div class="*:block">
				<span>Transaction</span>
				<Transaction id={event.trx_id} />
			</div>

			<div class="*:block">
				<span>Block</span>
				<Block number={event.globalseq} />
			</div>

			<div class="text-body grid sm:text-right">
				<span>{relativeTime}</span>
				<span class="text-muted text-label-sm">{absoluteTime}</span>
			</div>
		</div>
	</Card>
</div>
