<script lang="ts">
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import RAMDelta from '$lib/components/elements/ramdelta.svelte';
	import {Card} from 'unicove-components';

	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const ramDeltas = $derived(
		data.transaction.traces.filter((trace) => trace.account_ram_deltas.length)
	);
</script>

<div class="p-2">
	<h2 class="h2 text-2xl">{m.common_ram_usage()}</h2>
	<p>{m.common_ram_usage_description()}</p>
</div>

<Card>
	<table class="table-styles">
		<thead>
			<tr>
				<td class="text-right">Bytes</td>
				<td>Owner</td>
				<td class="text-right">{m.common_contract()}</td>
				<td>{m.common_action()}</td>
			</tr>
		</thead>
		<tbody>
			{#each ramDeltas as trace}
				{#each trace.account_ram_deltas as delta}
					<tr>
						<td class="text-right font-mono font-bold">
							<RAMDelta number={delta.delta} colored />
						</td>
						<td>
							<Account name={delta.account} />
						</td>
						<td class="text-right">
							<Contract name={trace.act.account} />
						</td>
						<td>
							<Contract name={trace.act.account} action={trace.act.name}>
								{trace.act.name}
							</Contract>
						</td>
					</tr>
				{/each}
			{/each}
		</tbody>
	</table>
</Card>
