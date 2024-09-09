<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Powerup from '../../components/forms/powerup.svelte';

	import State from '../../components/state/state.svelte';
	import { ResourceType } from '../../types';

	const { data } = $props();
</script>

<Stack>
	<PageHeader title="Network Resource" />

	<State resource={ResourceType.CPU} />
	<Powerup resourceType={ResourceType.CPU} network={data.network} />
</Stack>
