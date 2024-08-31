<script lang="ts">
	import { ABI } from '@wharfkit/antelope';
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';
	import Account from '$lib/components/link/account.svelte';

	const { data } = $props();

	const action = data.abi.actions.find((s: ABI.Action) => s.name === data.action);
	const actionData = data.abi.structs.find((s: ABI.Struct) => s.name === action.type);
</script>

<h2 class="h2">Action: {data.action}</h2>

<pre>{JSON.stringify(action, null, 2)}</pre>
<pre>{JSON.stringify(actionData, null, 2)}</pre>
