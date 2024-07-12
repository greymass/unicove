<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/wharf';

	onMount(() => {
		user.restore();
	});
</script>

<slot />
