<script lang="ts">
	import type { Component } from 'svelte';

	import ActionElement from '$lib/components/elements/action.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import type { ActionSummaryProps, ActionTraceFiltered } from '$lib/types/transaction';

	interface Props {
		summary?: Component<ActionSummaryProps, object>;
		trace: ActionTraceFiltered;
		variant?: ActionDisplayVariants;
		trxid?: boolean;
	}

	let { trace, trxid = false, summary, variant = 'json' }: Props = $props();
</script>

<ActionElement
	action={trace.action}
	datetime={trace.block_time.toDate()}
	decoded={trace.act.data}
	id={trxid ? trace.trx_id : undefined}
	notified={trace.notifications}
	{summary}
	{variant}
/>
