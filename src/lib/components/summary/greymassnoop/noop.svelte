<script lang="ts">
	import { Card } from '$lib/components/layout';
	import { cn } from '$lib/utils';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	const { ...props }: ActionSummaryProps = $props();
</script>

<Card class={cn('text-large @container gap-6', props.class)}>
	The resources usage for this transaction was provided by Fuel.
</Card>
