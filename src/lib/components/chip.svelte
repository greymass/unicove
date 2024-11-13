<script lang="ts">
	import { cn } from '$lib/utils';

	const props = $props();
</script>

<div class={cn('rounded bg-mineShaft-900 px-2 text-mineShaft-50', props.class)}>
	{@render props.children()}
</div>
