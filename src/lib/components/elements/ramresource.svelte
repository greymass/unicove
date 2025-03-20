<script lang="ts">
	import type { Int } from '@wharfkit/antelope';

	import { cn } from '$lib/utils';
	import ResourceCard from './resourceCard.svelte';

	interface Props {
		ramAvailable: Int;
		class?: string;
	}

	const { ramAvailable, ...props }: Props = $props();
</script>

<div class={cn('rounded-xl bg-mine-900/70 p-4 pb-2', props.class)}>
	<ResourceCard type="ram" value={ramAvailable} />
</div>
