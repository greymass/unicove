<script lang="ts">
	import type { Snippet } from 'svelte';
	import CircleX from 'lucide-svelte/icons/circle-x';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		error?: string;
		hidden?: boolean;
		onfailure?: Snippet;
	}

	const { error, hidden, onfailure }: Props = $props();
</script>

<div class="space-y-6 rounded-lg text-center" class:hidden>
	<CircleX class="inline size-24 text-red-300" />

	<div class=" space-y-3">
		<h2 class="h3">{m.common_transaction_error()}</h2>

		<p class="mx-auto max-w-prose break-words">
			{error}
		</p>
	</div>

	{#if onfailure}
		{@render onfailure()}
	{/if}
</div>
