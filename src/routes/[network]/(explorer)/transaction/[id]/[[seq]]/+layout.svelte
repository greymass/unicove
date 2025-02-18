<script lang="ts">
	import { Stack } from '$lib/components/layout/index.js';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { type UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	const { children, data } = $props();

	const { settings } = getContext<UnicoveContext>('state');

	const options = $derived.by(() => {
		let urlBase = `/${data.network}/transaction/${data.id}`;
		if (data.seq) {
			urlBase += `/${data.seq}`;
		}
		const options = [
			{ href: urlBase, text: m.common_summary() },
			{ href: `${urlBase}/actions`, text: 'Actions' },
			{ href: `${urlBase}/contracts`, text: 'Contracts' },
			{ href: `${urlBase}/resources`, text: 'Resources' },
			{ href: `${urlBase}/traces`, text: 'Traces' },
			{ href: `${urlBase}/transaction`, text: 'Transaction' }
		];
		if (settings.data.debugMode) {
			options.push({ href: `${urlBase}/data`, text: m.common_data() });
		}
		return options;
	});
</script>

<Stack class="@container">
	<PillGroup {options} />

	<h3 class="h3">
		{m.transaction_num_actions({
			number: data.transaction.actions.length
		})}
	</h3>

	{@render children()}
</Stack>
