<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Stack } from '$lib/components/layout';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<Stack>
	<h2 class="h2">Account State</h2>
	<p>The account state for the currently active session.</p>
	{#if context.account}
		<Button class="self-start" onclick={() => context.account?.refresh()}
			>Update account state</Button
		>
		<table>
			<tbody>
				{#if context.account.balances}
					<tr>
						<td>Balances (light_api)</td>
						<td>{context.account.balances.length}</td>
					</tr>
				{/if}
				{#if context.account.delegations}
					<tr>
						<td>Delegations (delband)</td>
						<td>{context.account.delegations.length}</td>
					</tr>
				{/if}
				<!-- <tr>
					<td>REX Data</td>
					<td>{account.rex}</td>
				</tr> -->
			</tbody>
		</table>
		<Code>
			{JSON.stringify(context.account, null, 2)}
		</Code>
	{:else}
		<p>No account state available.</p>
	{/if}
</Stack>
