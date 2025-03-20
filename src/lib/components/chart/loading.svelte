<script>
	import Card from '../layout/box/card.svelte';

	const props = $props();
</script>

<Card class="relative">
	<header>
		<p class="text-muted my-0">{props.pair}</p>
		<div class="flex justify-between">
			<div>
				<div class="mt-1 h-4 w-32 animate-pulse rounded-full bg-mine-shaft-900"></div>
				<div class="mt-1 h-4 w-16 animate-pulse rounded-full bg-mine-shaft-900"></div>
			</div>
			<div class="mt-1 h-4 w-16 animate-pulse rounded-full bg-mine-shaft-900"></div>
		</div>
	</header>

	<div class="grid h-32 place-items-center">
		<svg
			class="size-8 animate-spin text-mine-shaft-700"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	</div>

	<hr class="h-px border-0 bg-mine-shaft-800" />

	<div class="flex items-center justify-between font-medium">
		<div class="mt-1 h-4 w-16 animate-pulse rounded-full bg-mine-shaft-900"></div>
		<div class="flex gap-4">
			<div class="flex items-center gap-1">
				<div class="size-4 rounded-sm bg-[#00ED97]"></div>
				<span class="text-[#00ED97]">{props.pair}</span>
			</div>
		</div>
		<div class="mt-1 h-4 w-16 animate-pulse rounded-full bg-mine-shaft-900"></div>
	</div>
</Card>
