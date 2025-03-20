<script lang="ts">
	import { cn } from '$lib/utils/style';

	let props = $props();
</script>

<dd class={cn('grow text-right text-balance break-all tabular-nums', props.class)}>
	{@render props.children()}
</dd>
