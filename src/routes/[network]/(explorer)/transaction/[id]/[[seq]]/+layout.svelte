<script lang="ts">
	import { Stack } from '$lib/components/layout/index.js';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { type UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	const { children, data } = $props();

	const { settings } = getContext<UnicoveContext>('state');

	let ramDeltas = $derived.by(() => {
		return data.transaction.traces.reduce((acc, trace) => {
			if (trace.account_ram_deltas.length) {
				acc += trace.account_ram_deltas.length;
			}
			return acc;
		}, 0);
	});

	const options = $derived.by(() => {
		let urlBase = `/${data.network}/transaction/${data.id}`;
		if (data.seq) {
			urlBase += `/${data.seq}`;
		}
		const options = [
			{ href: urlBase, text: m.common_summary() },
			// { href: `${urlBase}/resources`, text: 'Resources' },
			{ href: `${urlBase}/transaction`, text: 'Transaction' },
			{
				href: `${urlBase}/actions`,
				text: `Actions (${data.transaction.transaction.actions.length})`
			}
		];
		if (settings.data.advancedMode) {
			options.push({
				href: `${urlBase}/traces`,
				text: `Traces (${data.transaction.traces.length})`
			});
			options.push({
				href: `${urlBase}/ram`,
				text: `RAM Deltas (${ramDeltas})`
			});
			options.push({ href: `${urlBase}/data`, text: m.common_data() });
		}
		return options;
	});
</script>

<Stack class="@container gap-12">
	<PillGroup {options} />

	{@render children()}
</Stack>
