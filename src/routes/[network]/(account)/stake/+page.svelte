<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<Pageheader title="Stake" subtitle="Overview" />
<Code>{JSON.stringify(context, null, 2)}</Code>
