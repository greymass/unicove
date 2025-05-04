<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
	const props = $props();
</script>

{props.data.account.last_update}

<Code>
	{JSON.stringify(props.data.balance, null, 2)}
</Code>
