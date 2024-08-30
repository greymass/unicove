<<<<<<< HEAD
<h1>NET</h1>
=======
<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import State from '../components/state/state.svelte';
	import Prices from '../components/state/prices.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { calSize, calUsagePer } from '../utils.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const availableSize = $derived(calSize(Number(context.account?.net?.available)));
	const usedSize = $derived(calSize(Number(context.account?.net?.used)));
	const maxSize = $derived(calSize(Number(context.account?.net?.max)));

	const usagePerc = $derived(
		calUsagePer(Number(context.account?.net?.used), Number(context.account?.net?.max))
	);
	const network = $derived(String(data.network));
</script>

<Stack>
	<h1>CPU Resources</h1>
	<hr />
	<State
		name="Net"
		available="{availableSize}ms"
		used="{usedSize}ms"
		max="{maxSize}ms"
		percentage={usagePerc}
	/>
	<div>
		<Prices
			name="NET"
			powerupLink="/{network}/resources/net/powerup"
			rexLink="/{network}/resources/net/rex"
			stakeLink="/{network}/resources/net/stake"
		/>
	</div>
</Stack>
>>>>>>> kurt-powerup
