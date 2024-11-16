<script lang="ts">
	import { cn } from '$lib/utils';

	import ResourceCard from './resourceCard.svelte';

	interface Props {
		ramAvailable: number;
		precision?: number;
		class?: string;
	}

	const { ramAvailable, precision = 2, ...props }: Props = $props();
</script>

<div class={cn('rounded-xl bg-mineShaft-900/70 p-4 pb-2', props.class)}>
	<ResourceCard type="ram" value={ramAvailable.toFixed(precision)} />
</div>
