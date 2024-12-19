<script lang="ts">
	import { cn } from '$lib/utils/style';

	let props = $props();
</script>

<dd class={cn('grow text-balance break-all text-right tabular-nums', props.class)}>
	{@render props.children()}
</dd>
