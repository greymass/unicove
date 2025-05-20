<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';

	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { ArrowBigRight, NotebookText } from 'lucide-svelte';
	import Chip from '$lib/components/chip.svelte';
	import type { Snippet } from 'svelte';
	import Row from './row.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		from: NameType;
		to: NameType;
		quantity: AssetType;
		children?: Snippet;
		memo?: string;
		perspectiveOf?: Name;
	}

	const { from, to, quantity, memo, perspectiveOf, ...props }: Props = $props();

	const isSend = $derived(perspectiveOf && perspectiveOf.equals(from));
	const isReceive = $derived(perspectiveOf && perspectiveOf.equals(to));
</script>

<Row>
	{#if isSend}
		<Chip class="bg-error-container text-white">{m.common_sent()}</Chip>
	{:else if isReceive}
		<Chip class="bg-success-container text-white">{m.common_received()}</Chip>
	{:else}
		<Chip class="">Transfer</Chip>
	{/if}

	<AssetElement class="" value={Asset.from(quantity)} variant="full" />

	<AccountLink class="" name={Name.from(from)} />

	<ArrowBigRight class="size-6" />

	<AccountLink class="" name={Name.from(to)} />

	{#if memo}
		<div class="flex table-caption max-w-fit items-center gap-2 overflow-auto px-4 text-nowrap">
			<NotebookText class="inline size-5" />
			Memo: {memo}
		</div>
	{/if}

	{#if props.children}
		<span>
			{@render props.children()}
		</span>
	{/if}
</Row>
