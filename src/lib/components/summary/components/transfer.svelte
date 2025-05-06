<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';

	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { ArrowBigRight } from 'lucide-svelte';
	import Chip from '$lib/components/chip.svelte';
	import type { Snippet } from 'svelte';
	import Row from './row.svelte';

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

<Row>
	{#if isSend}
		<Chip class="bg-error text-on-error">Sent</Chip>
	{:else if isReceive}
		<Chip class="bg-success text-on-success">Received</Chip>
	{:else}
		<Chip class="">Transfer</Chip>
	{/if}

	<AssetElement class="" value={Asset.from(quantity)} variant="full" />

	<AccountLink class="" name={Name.from(from)} />

	<ArrowBigRight class="size-6" />

	<AccountLink class="" name={Name.from(to)} />

	{#if props.children}
		<span>
			{@render props.children()}
		</span>
	{/if}
</Row>
