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
			// { href: `${urlBase}/resources`, text: 'Resources' },
			{ href: `${urlBase}/transaction`, text: 'Transaction' }
		];
		if (settings.data.debugMode) {
			options.push({
				href: `${urlBase}/traces`,
				text: `Traces (${data.transaction.traces.length})`
			});
			options.push({ href: `${urlBase}/data`, text: m.common_data() });
		}
		return options;
	});
</script>

<Stack class="@container">
	<PillGroup {options} />

	{@render children()}
</Stack>
