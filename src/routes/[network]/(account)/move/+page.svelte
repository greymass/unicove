<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<h1>Move</h1>
<Code>{JSON.stringify(context, null, 2)}</Code>
