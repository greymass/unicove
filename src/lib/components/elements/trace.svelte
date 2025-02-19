<script lang="ts">
	import type { Component } from 'svelte';

	import ActionElement from '$lib/components/elements/action.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import type { ActionTraceFiltered } from '$lib/types/transaction';

	interface Props {
		summary?: Component<any, {}>;
		trace: ActionTraceFiltered;
		variant?: ActionDisplayVariants;
	}

	let { trace, summary, variant = 'json' }: Props = $props();
</script>

<ActionElement
	action={trace.action}
	datetime={trace.block_time.toDate()}
	decoded={trace.act.data}
	id={trace.trx_id}
	notified={trace.notifications}
	{summary}
	{variant}
/>
