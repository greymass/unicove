<script lang="ts">
	import AccountText from '$lib/components/elements/account.svelte';
	import VoteWeight from '$lib/components/elements/voteweight.svelte';
	import { Float64 } from '@wharfkit/antelope';

	const { data } = $props();
</script>

<table class="table-styles">
	<tbody>
		<tr>
			<td> Proxied To </td>
			<td class="text-right">
				<AccountText name={data.account.voter.proxy} />
			</td>
		</tr>
		<tr>
			<td> Is Proxy? </td>
			<td class="text-right">
				{#if data.account.voter.isProxy}
					Yes
				{:else}
					No
				{/if}
			</td>
		</tr>
		<tr>
			<td> Total Vote Weight </td>
			<td class="text-right">
				<VoteWeight weight={data.account.voter.weight} variant="full" />
			</td>
		</tr>
		<tr>
			<td> Self Vote Weight </td>
			<td class="text-right">
				<VoteWeight
					weight={Float64.from(
						Number(data.account.voter.weight) - Number(data.account.voter.proxyWeight)
					)}
					variant="full"
				/>
			</td>
		</tr>
		<tr>
			<td> Proxied Weight </td>
			<td class="text-right">
				<VoteWeight weight={data.account.voter.proxyWeight} variant="full" />
			</td>
		</tr>
	</tbody>
</table>

{#if data.account.voter.votes.length}
	<table class="table-styles">
		<thead>
			<tr>
				<th>Block Producer</th>
			</tr>
		</thead>
		<tbody>
			{#each data.account.voter.votes as vote}
				<tr>
					<td>
						<AccountText name={vote} />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
