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
	<State resource={ResourceType.CPU} />
	<Prices
		resource={ResourceType.CPU}
		powerupLink="/{network}/resources/cpu/powerup"
		rexLink="/{network}/resources/cpu/rex"
		stakeLink="/{network}/resources/cpu/stake"
	/>
</Stack>
