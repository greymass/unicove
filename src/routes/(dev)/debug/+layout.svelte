<script lang="ts">
	let { children } = $props();
import { Box } from '$lib/components/layout';
</script>

<Box>
	{@render children()}
</Box>
