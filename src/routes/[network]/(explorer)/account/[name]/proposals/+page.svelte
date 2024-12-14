<script lang="ts">
	import Card from '$lib/components/layout/box/card.svelte';

	const { data } = $props();
</script>

{#each data.proposals as proposal}
	<Card>
		<h2>
			<a href={`/${data.network}/msig/${data.name}/${proposal.proposal_name}`}
				>{proposal.proposal_name}</a
			>
		</h2>
	</Card>
{/each}
