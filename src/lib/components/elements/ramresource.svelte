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

<div class={cn('bg-surface-container-high rounded-xl p-4 pb-2', props.class)}>
	<ResourceCard type="ram" value={ramAvailable} />
</div>
