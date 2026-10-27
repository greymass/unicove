<script lang="ts">
	import { Card } from '@wharfkit/svelte-components';

	const { contract }: { contract: string } = $props();
</script>

<Card title="Network-funded onboarding">
	<p class="max-w-prose text-pretty">
		The gift program runs from <span class="font-mono">{contract}</span>, an account VP-0001 creates
		when producers enact it. Its endowment, creators and gifts appear here once that account exists
		on chain.
	</p>
</Card>
