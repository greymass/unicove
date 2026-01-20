<script lang="ts">
	import ActivityV1 from './ActivityV1.svelte';
	import ActivityV2 from './ActivityV2.svelte';

	let { data } = $props();
</script>

{#if data.network.supports('robo2')}
	<ActivityV2 {data} />
{:else}
	<ActivityV1 {data} />
{/if}
