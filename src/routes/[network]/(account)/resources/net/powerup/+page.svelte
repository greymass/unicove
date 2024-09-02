<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Powerup from '../../components/forms/powerup.svelte';

	import State from '../../components/state/state.svelte';
	import { ResourceType } from '../../types.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { calSize, calUsagePer } from '../../utils.svelte';

	const context = getContext<UnicoveContext>('state');

	const availableSize = $derived(calSize(Number(context.account?.net?.available)));
	const usedSize = $derived(calSize(Number(context.account?.net?.used)));
	const maxSize = $derived(calSize(Number(context.account?.net?.max)));

	const usagePerc = $derived(
		calUsagePer(Number(context.account?.net?.used), Number(context.account?.net?.max))
	);
</script>

<Stack>
	<PageHeader title="Network Resource" />

	<State
		resource={ResourceType.NET}
		available="{availableSize}kb"
		used="{usedSize}kb"
		max="{maxSize}kb"
		percentage={usagePerc}
	/>
	<Powerup resourceType={ResourceType.NET} />
</Stack>
