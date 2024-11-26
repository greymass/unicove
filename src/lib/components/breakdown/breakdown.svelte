<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import type { Snippet } from 'svelte';
	interface Props {
		children: Snippet;
	}
	let props: Props = $props();
</script>

<Stack class="gap-2">
	<h5 class="h5">Breakdown</h5>
	<Stack class="gap-0 @container ">
		{@render props.children()}
	</Stack>
</Stack>
