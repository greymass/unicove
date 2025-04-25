<script lang="ts">
	import Link from '$lib/components/elements/link.svelte';
	import Card from '$lib/components/layout/box/card.svelte';

	const { data } = $props();

	const proposals = $derived(data.account.proposals);
</script>

{#each proposals as proposal}
	<Card titleTag="span" title="Proposal ID">
		<h2 class="">
			<Link href={`/${data.network}/msig/${data.name}/${proposal.proposal_name}`}>
				{proposal.proposal_name}
			</Link>
		</h2>
	</Card>
{:else}
	<Card>
		<p>No proposals found.</p>
	</Card>
{/each}
