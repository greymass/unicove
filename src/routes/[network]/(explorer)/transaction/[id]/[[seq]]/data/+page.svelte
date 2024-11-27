<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Code>
	{JSON.stringify(data.transaction, null, 2)}
</Code>
