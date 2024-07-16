<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/wharf';

	let { children } = $props();

	onMount(() => {
		user.restore();
	});
</script>

{@render children()}
