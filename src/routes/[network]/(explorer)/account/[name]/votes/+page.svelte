<script lang="ts">
	import AccountText from '$lib/components/elements/account.svelte';

	const { data } = $props();
</script>

<table class="table-styles">
	<tbody>
		<tr>
			<td> Proxied To </td>
			<td>
				<AccountText name={data.account.voter.proxy} />
			</td>
		</tr>
		<tr>
			<td> Is Proxy? </td>
			<td>
				{#if data.account.voter.isProxy}
					Yes
				{:else}
					No
				{/if}
			</td>
		</tr>
		<tr>
			<td> Vote Weight </td>
			<td>
				{data.account.voter.weight}
			</td>
		</tr>
		<tr>
			<td> Proxy Weight </td>
			<td>
				{data.account.voter.proxyWeight}
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
