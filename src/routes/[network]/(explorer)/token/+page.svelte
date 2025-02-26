<script lang="ts">
	import Code from '$lib/components/code.svelte';

	let { data } = $props();
</script>

<Code>
	{JSON.stringify(data.tokens, undefined, 2)}
</Code>
