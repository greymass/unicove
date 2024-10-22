<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import State from '../components/state/state.svelte';
	import Prices from '../components/state/prices.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';

	import { ResourceType } from '../types';

	const { data } = $props();
	const network = $derived(String(data.network));
</script>

<PageHeader title="Network Resources" />
<Stack class="mt-10">
	<State resource={ResourceType.NET} />
	<Prices
		resource={ResourceType.NET}
		powerupLink="/{network}/resources/net/powerup"
		rexLink="/{network}/resources/net/rex"
		stakeLink="/{network}/resources/net/stake"
	/>
</Stack>
