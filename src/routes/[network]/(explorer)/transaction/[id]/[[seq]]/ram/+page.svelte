<script lang="ts">
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import { Card, Number, Table, TH, TR, TD } from 'unicove-components';

	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const ramDeltas = $derived(
		data.transaction.traces.filter((trace) => trace.account_ram_deltas.length)
	);
</script>

<div class="p-2">
	<h2 class="text-headline text-2xl">{m.common_ram_usage()}</h2>
	<p>{m.common_ram_usage_description()}</p>
</div>

<Card>
	<Table full>
		{#snippet thead()}
			<TH class="text-right">Bytes</TH>
			<TH>Owner</TH>
			<TH class="text-right">{m.common_contract()}</TH>
			<TH>{m.common_action()}</TH>
		{/snippet}

		{#each ramDeltas as trace}
			{#each trace.account_ram_deltas as delta}
				<TR>
					<TD class="text-right font-mono font-bold">
						<Number delta number={-delta.delta} colored />
					</TD>
					<TD>
						<Account name={delta.account} />
					</TD>
					<TD class="text-right">
						<Contract name={trace.act.account} />
					</TD>
					<TD>
						<Contract name={trace.act.account} action={trace.act.name}>
							{trace.act.name}
						</Contract>
					</TD>
				</TR>
			{/each}
		{/each}
	</Table>
</Card>
