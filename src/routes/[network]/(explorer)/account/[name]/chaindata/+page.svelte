<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

<Code>{JSON.stringify(data.account, null, 2)}</Code>
