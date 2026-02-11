<script lang="ts">
	import type { ActionSummaryProps } from '$lib/types/transaction';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: { message: string };
	}

	const { data }: Props = $props();

	let paragraphs = $derived(data.message.split(/\n\n+/).map((p) => p.trim()).filter(Boolean));
</script>

<div class="max-w-prose space-y-4 text-sm leading-7">
	{#each paragraphs as paragraph}
		<p class="whitespace-pre-wrap break-words">{paragraph}</p>
	{/each}
</div>
