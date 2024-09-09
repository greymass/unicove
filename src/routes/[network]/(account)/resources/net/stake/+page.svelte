<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Staking from '../../components/forms/staking.svelte';

	import State from '../../components/state/state.svelte';
	import { ResourceType } from '../../types';
</script>

<Stack>
	<PageHeader title="Network Resource" />

	<State resource={ResourceType.NET} />
	<Staking resourceType={ResourceType.NET} />
</Stack>
