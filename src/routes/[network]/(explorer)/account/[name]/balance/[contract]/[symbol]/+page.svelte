<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const props = $props();
</script>

{props.data.account.last_update}

<Code>
	{JSON.stringify(props.data.balance, null, 2)}
</Code>
