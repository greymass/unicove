<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import { HardDrive } from 'lucide-svelte';

	const context = getContext<UnicoveContext>('state');
	let ramOwned = $derived(Asset.from(Number(context.account?.ram?.max || 0) / 1000, '4,KB'));
</script>

<Card class="flex gap-4 bg-shark-500/20 p-4">
	<HardDrive class="h-7 w-7" />
	<div class="flex flex-1 flex-col text-right">
		<h1 class="mb-4 text-xl">RAM</h1>
		<AssetText class="text-xl" variant="full" value={ramOwned} />
		<h1 class="text-xl text-gray-400">Available</h1>
	</div>
</Card>
