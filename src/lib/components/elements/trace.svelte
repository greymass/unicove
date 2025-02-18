<script lang="ts">
	import ActionElement from '$lib/components/elements/action.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import type { ActionTraceFiltered } from '$lib/types/transaction';

	interface Props {
		trace: ActionTraceFiltered;
		variant?: ActionDisplayVariants;
	}

	let { trace, variant = 'json' }: Props = $props();
</script>

<ActionElement action={trace.action} decoded={trace.act.data} {variant} />
