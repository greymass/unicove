<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Stack } from '$lib/components/layout';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Card from '$lib/components/layout/box/card.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
</script>

<Stack>
	<Pageheader title={data.network.chain.name} />
	<Pageheader title="Token" subtitle="Token Overview" />
	<Card>Token Chart and Information</Card>
	<Pageheader title="Staking" subtitle="Staking Overview" />
	<Card>Staking Chart and Information</Card>
	<Pageheader title="RAM" subtitle="RAM Overview" />
	<Card>RAM Chart and Information</Card>
</Stack>
