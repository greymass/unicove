<script lang="ts">
	import { Card } from '$lib/components/layout';

	let props = $props();
</script>

<Card class="flex justify-center py-6 *:max-w-md *:grow">
	{@render props.children()}
</Card>
