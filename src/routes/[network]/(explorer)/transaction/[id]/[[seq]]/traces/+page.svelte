<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { Action, NameType } from '@wharfkit/antelope';

	let { data } = $props();

	// Define the Action interface
	interface Trace {
		act: Action;
		receipt: { receiver: NameType };
	}
</script>

{#if data.transaction?.traces}
	{@const actions = data.transaction.traces as Trace[]}
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
						{action.receipt.receiver}
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
