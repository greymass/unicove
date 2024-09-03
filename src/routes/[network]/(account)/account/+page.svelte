<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<Stack>
	<Pageheader title={context.account?.name} subtitle="Account Overview" />
	<Pageheader title="Tokens" subtitle="Token balances" />
	<Pageheader title="Staking" subtitle="Staked balances" />
	<Pageheader title="RAM" subtitle="Information about this account's RAM" />
</Stack>
