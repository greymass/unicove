<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import State from '../components/state/state.svelte';
	import Prices from '../components/state/prices.svelte';
	import { preventDefault } from '$lib/utils';
	import PageHeader from '$lib/components/pageheader.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { calSize, calUsagePer } from '../utils.svelte';
	import { ResourceType } from '../types.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const availableSize = $derived(calSize(Number(context.account?.cpu?.available)));
	const usedSize = $derived(calSize(Number(context.account?.cpu?.used)));
	const maxSize = $derived(calSize(Number(context.account?.cpu?.max)));

	const usagePerc = $derived(
		calUsagePer(Number(context.account?.cpu?.used), Number(context.account?.cpu?.max))
	);

	const network = $derived(String(data.network));
</script>

<PageHeader title="Network Resources" />
<Stack class="mt-10">
	<State
		resource={ResourceType.CPU}
		available="{availableSize}ms"
		used="{usedSize}ms"
		max="{maxSize}ms"
		percentage={usagePerc}
	/>
	<div>
		<Prices
			resource={ResourceType.CPU}
			powerupLink="/{network}/resources/cpu/powerup"
			rexLink="/{network}/resources/cpu/rex"
			stakeLink="/{network}/resources/cpu/stake"
		/>
	</div>
</Stack>
