<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';

	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { ArrowBigRight } from 'lucide-svelte';
	import Chip from '$lib/components/chip.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		from: NameType;
		to: NameType;
		quantity: AssetType;
		children?: Snippet;
		memo?: string;
		perspectiveOf?: Name;
	}

	const { from, to, quantity, perspectiveOf, ...props }: Props = $props();

	const isSend = $derived(perspectiveOf && perspectiveOf.equals(from));
	const isReceive = $derived(perspectiveOf && perspectiveOf.equals(to));
</script>

{#if isSend}
	<Chip class="col-start-1 col-end-2 w-full bg-red-600 text-center text-white">Sent</Chip>
{:else if isReceive}
	<Chip class="col-start-1 col-end-2 w-full bg-green-600 text-center text-white">Received</Chip>
{:else}
	<Chip class="col-start-1 col-end-2 w-full text-center">Transfer</Chip>
{/if}
<AssetElement class="col-start-2 col-end-4" value={Asset.from(quantity)} variant="full" />
<AccountLink class="col-start-4 col-end-5" name={Name.from(from)} />
<div class="col-start-5 col-end-6 items-center justify-self-center">
	<ArrowBigRight />
</div>
<AccountLink class="col-start-6 col-end-7" name={Name.from(to)} />
{#if props.children}
	<span>
		{@render props.children()}
	</span>
{/if}
