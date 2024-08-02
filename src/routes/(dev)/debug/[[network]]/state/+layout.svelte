<script lang="ts">
	let { children } = $props();
	import Pagemargin from '$lib/components/layout/box/pagemargin.svelte';
	import StateNavigation from './navigation.svelte';
</script>

<StateNavigation />

<Pagemargin>
	{@render children()}
</Pagemargin>
