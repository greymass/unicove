<script lang="ts">
	import CircleX from 'lucide-svelte/icons/circle-x';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		error?: string;
		hidden?: boolean;
	}

	const { error, hidden }: Props = $props();
</script>

<div class="space-y-6 rounded-lg" class:hidden>
	<div class="flex flex-col items-center gap-6">
		<picture class="size-24">
			<CircleX class="size-full text-red-300" />
		</picture>
		<h2 class="h3">{m.common_transaction_error()}</h2>
	</div>
	<p class="py-4">
		{error}
	</p>
</div>
