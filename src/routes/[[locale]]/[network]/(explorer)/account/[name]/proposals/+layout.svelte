<script lang="ts">
	import { Stack } from 'unicove-components';

	const { children } = $props();
</script>

<Stack>
	{@render children()}
</Stack>
