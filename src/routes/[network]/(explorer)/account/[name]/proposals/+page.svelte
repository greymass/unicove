<script lang="ts">
	import Link from '$lib/components/elements/link.svelte';
	import {Card} from 'unicove-components';
	import * as m from '$lib/paraglide/messages';

	const { data } = $props();

	const proposals = $derived(data.account.proposals);
</script>

{#each proposals as proposal}
	<Card titleTag="span" title={m.common_proposal_id()}>
		<h2 class="">
			<Link href={`/${data.network}/msig/${data.name}/${proposal.proposal_name}`}>
				{proposal.proposal_name}
			</Link>
		</h2>
	</Card>
{:else}
	<Card>
		<p>{m.common_no_proposals()}</p>
	</Card>
{/each}
