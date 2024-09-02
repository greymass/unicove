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

	const availableSize = $derived(calSize(Number(context.account?.cpu?.available)));
	const usedSize = $derived(calSize(Number(context.account?.cpu?.used)));
	const maxSize = $derived(calSize(Number(context.account?.cpu?.max)));

	const usagePerc = $derived(
		calUsagePer(Number(context.account?.cpu?.used), Number(context.account?.cpu?.max))
	);
</script>

<Stack>
	<PageHeader title="Network Resource" />

	<State
		resource={ResourceType.CPU}
		available="{availableSize}ms"
		used="{usedSize}ms"
		max="{maxSize}ms"
		percentage={usagePerc}
	/>
	<Powerup resourceType={ResourceType.CPU} />
</Stack>
