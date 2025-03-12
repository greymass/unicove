<script lang="ts">
	import Code from '$lib/components/code.svelte';

	let { data } = $props();
</script>

<Code>
	{JSON.stringify(data, undefined, 2)}
</Code>
