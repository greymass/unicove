<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import { Card, Stack } from '$lib/components/layout';
	import * as TokenContract from '$lib/wharf/contracts/token';
	import { cn } from '$lib/utils';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	const { ...props }: ActionSummaryProps = $props();
</script>

<Card class={cn('text-large gap-6 @container', props.class)}>
	The resources usage for this transaction was sponsored by Fuel.
</Card>
