<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';

	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { ArrowBigRight, NotebookText } from 'lucide-svelte';
	import {Chip} from 'unicove-components';
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
	<div class="grid items-center gap-x-4 gap-y-1 @2xl:flex @2xl:justify-between">
		{#if isSend}
			<Chip class="bg-error-container text-on-error-container">{m.common_sent()}</Chip>
		{:else if isReceive}
			<Chip class="bg-success-container text-on-success-container">{m.common_received()}</Chip>
		{:else}
			<Chip class="">Transfer</Chip>
		{/if}

		<AssetElement class="text-left" value={Asset.from(quantity)} variant="full" />
	</div>

	<div class="flex items-center gap-2">
		<AccountLink class="" name={Name.from(from)} />

		<ArrowBigRight class="size-5 shrink-0" />

		<AccountLink class="" name={Name.from(to)} />
	</div>

	<div class="text-balance">
		{#if memo}
			<NotebookText class="mb-1 inline size-4 shrink-0" />
			Memo: {memo}
		{/if}

		{#if props.children}
			<span>
				{@render props.children()}
			</span>
		{/if}
	</div>
</Row>
