<script lang="ts">
	import { page } from '$app/stores';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';

	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { data, children } = $props();

	let currentTab = $derived($page.url.pathname.split('/')[4] || 'overview');
	const subtitle = $derived.by(() => {
		switch (currentTab) {
			case 'powerup':
			case 'rex':
			case 'stake':
				return 'Renting';
			default:
				return 'Overview';
		}
	});
	const isRenting = $derived(subtitle === 'Renting');
</script>

<Stack>
	<div class="flex gap-4">
		{#if isRenting}
			<a
				href="/{data.network}/resources"
				class="flex size-11 items-center justify-center rounded-full bg-[#303338] text-center"
			>
				<ChevronLeft class="size-7 text-skyBlue-500" />
			</a>
		{/if}
		<Pageheader title="Resources" {subtitle} />
	</div>

	{@render children()}
</Stack>
