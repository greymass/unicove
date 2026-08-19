<script lang="ts">
	import { Card } from 'unicove-components';
	import AccountLink from '$lib/components/elements/account.svelte';

	interface Props {
		accounts: string[];
	}

	const { accounts }: Props = $props();
</script>

{#if accounts.length}
	<Card>
		<h3 class="text-label-sm text-muted mb-3">Related accounts</h3>
		<div class="flex flex-wrap gap-2">
			{#each accounts as account (account)}
				<AccountLink name={account} />
			{/each}
		</div>
	</Card>
{/if}
