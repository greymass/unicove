<script lang="ts">
	import { getContext } from 'svelte';

	import { Code } from 'unicove-components';
	import { Stack } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';

	import { ApprovalManager } from '../manager.svelte';

	let { data } = $props();

	let context = getContext<UnicoveContext>('state');

	const manager = $state(new ApprovalManager(context, data.proposal));
	$effect(() => {
		manager.sync(data.network, context.wharf);
	});
</script>

<Stack class="mt-6">
	<Code json={manager.proposal.transaction} />
</Stack>
