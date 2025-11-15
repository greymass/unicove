<script lang="ts">
	import Link from '$lib/components/elements/link.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';
	import { Card } from 'unicove-components';

	const { data } = $props();
	const { urlPath } = getContext<UnicoveContext>('state');

	const proposals = $derived(data.account.proposals);
</script>

{#each proposals as proposal}
	<Card titleTag="span" title="Proposal ID">
		<h2 class="">
			<Link href={urlPath(`/msig/${data.name}/${proposal.proposal_name}`)}>
				{proposal.proposal_name}
			</Link>
		</h2>
	</Card>
{:else}
	<Card>
		<p>No proposals found.</p>
	</Card>
{/each}
