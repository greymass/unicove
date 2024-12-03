<script lang="ts">
	import Code from '$lib/components/code.svelte';

	let props = $props();
</script>

<Code>
	{JSON.stringify(props.data, null, 2)}
</Code>
