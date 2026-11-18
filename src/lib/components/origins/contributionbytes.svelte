<script lang="ts">
	import type { Contribution } from '$lib/state/creationindex/client';
	import { formatBytes } from '$lib/utils/bytes';

	interface Props {
		contribution: Contribution;
	}

	let { contribution }: Props = $props();
</script>

{#if contribution.bytes !== null}
	{formatBytes(contribution.bytes)}
{:else if contribution.requested_bytes !== null}
	{formatBytes(contribution.requested_bytes)} requested
{:else if contribution.quantity}
	{contribution.quantity} paid
{/if}
