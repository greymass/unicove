<script lang="ts">
	import type { Component } from 'svelte';

	import ActionElement from '$lib/components/elements/action.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import type { ActionSummaryProps, ActionTraceFiltered } from '$lib/types/transaction';

	interface Props {
		date?: boolean;
		summary?: Component<ActionSummaryProps, object>;
		trace: ActionTraceFiltered;
		variant?: ActionDisplayVariants;
		trxid?: boolean;
	}

	let { date = false, trace, trxid = false, summary, variant = 'pretty' }: Props = $props();
</script>

<ActionElement
	action={trace.action}
	datetime={date ? trace.block_time.toDate() : undefined}
	objectified={trace.act.data}
	id={trxid ? trace.trx_id : undefined}
	notified={trace.notifications}
	{summary}
	{variant}
/>
