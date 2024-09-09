<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Rex from '../../components/forms/rex.svelte';

	import State from '../../components/state/state.svelte';
	import { ResourceType } from '../../types';

	const { data } = $props();
</script>

<Stack>
	<PageHeader title="Network Resource" />

	<State resource={ResourceType.NET} />
	<Rex resourceType={ResourceType.NET} network={data.network} />
</Stack>
