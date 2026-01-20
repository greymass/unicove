<script lang="ts">
	import ActivityV1 from './ActivityV1.svelte';
	import ActivityV2 from './ActivityV2.svelte';

	let { data } = $props();

	let fallbackToV1 = $state(false);
</script>

{#if data.network.supports('robo2') && !fallbackToV1}
	<ActivityV2 {data} onError={() => (fallbackToV1 = true)} />
{:else}
	<ActivityV1 {data} />
{/if}
