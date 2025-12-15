<script lang="ts">
	import { getContext } from 'svelte';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Stack } from 'unicove-components';

	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;
	const { children, data } = $props();

	const account = $derived(String(data.name));

	const options = $derived.by(() => [
		{ href: urlPath(`/account/${account}/proposals`), text: 'Created' },
		{ href: urlPath(`/account/${account}/proposals/approvals`), text: 'Approvals' },
		{ href: urlPath(`/account/${account}/proposals/timeline`), text: 'Timeline' }
	]);
</script>

<Stack class="gap-6">
	<PillGroup {options} />
	{@render children()}
</Stack>
