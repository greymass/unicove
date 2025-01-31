<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { Action, NameType } from '@wharfkit/antelope';

	let { data } = $props();
	const deduplicateTraces = (traces: any) => {
		return Object.values(
			traces.reduce((item: any, trace: any) => {
				const contract = trace.act.account;
				if (!item[contract]) {
					item[contract] = { ...trace, receivers: new Set() };
				}
				item[contract].receivers.add(trace.receiver);
				delete item[contract].receiver;
				delete item[contract].receipt.receiver;
				return item;
			}, {})
		).map((trace: any) => ({
			...trace,
			receivers: [...trace.receivers] // Convert Set to Array
		}));
	};

	const traces = deduplicateTraces(data.transaction?.traces);
	// Define the Action interface
	interface Trace {
		act: Action;
		receivers: [NameType];
	}
</script>

{#if traces}
	{@const actions = traces as Trace[]}
	<table class="table-styles">
		<thead>
			<tr>
				<th>Contract</th>
				<th>Receiver</th>
				<th>Authorization</th>
				<th>Data</th>
			</tr>
		</thead>
		<tbody>
			{#each actions as action}
				<tr>
					<td>
						<p>
							<a href={`/${data.network}/contract/${action.act.account}`}>
								{action.act.account}
							</a>
						</p>
						<a href={`/${data.network}/contract/${action.act.account}/actions/${action.act.name}`}>
							{action.act.name}
						</a>
					</td>
					<td>
						{#each action.receivers as receiver}
							<div>{receiver}</div>
						{/each}
					</td>
					<td>
						{#each action.act.authorization as auth}
							<div>
								<a href={`/${data.network}/account/${auth.actor}`}>
									{auth.actor}@{auth.permission}
								</a>
							</div>
						{/each}
					</td>
					<td>
						<Code>{JSON.stringify(action.act.data, null, 2)}</Code>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>No actions</p>
{/if}
