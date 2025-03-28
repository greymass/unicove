<script lang="ts">
	import {
		AppWindow,
		ArrowLeftRight,
		Box,
		Boxes,
		Key,
		ReceiptText,
		UserSearch
	} from 'lucide-svelte';
	import type { ComponentProps, Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	import { SearchRecordType, type SearchRecord } from '$lib/state/search.svelte';
	import { cn, truncateCenter } from '$lib/utils';
	import type TextInput from '../input/text.svelte';

	interface ResultProps extends ComponentProps<typeof TextInput> {
		record: SearchRecord;
		onclick: (event: MouseEvent) => void;
		active?: boolean;
		children?: Snippet;
	}

	let { record, onclick, active, children, ...props }: ResultProps = $props();
</script>

<a
	data-active={active}
	class={cn(
		'focus-visible:ring-solar-500 grid grid-cols-subgrid items-center rounded-lg select-none focus-visible:ring-3 focus-visible:outline-hidden focus-visible:ring-inset sm:col-span-2',
		props.class
	)}
	href={record.url}
	{onclick}
>
	<div class="table-cell-styles ml-2 flex items-center gap-2 font-mono tabular-nums">
		{#if record.type === SearchRecordType.ACCOUNT}
			<UserSearch class="size-4" />
			<span>{record.value}</span>
		{:else if record.type === SearchRecordType.BLOCK}
			<Box class="size-4" />
			<span>{record.value}</span>
		{:else if record.type === SearchRecordType.CONTRACT}
			<ReceiptText class="size-4" />
			<span>{record.value}</span>
		{:else if record.type === SearchRecordType.KEY}
			<Key class="size-4" />
			<span class="max-w-[12ch] truncate">
				{record.value}
			</span>
		{:else if record.type === SearchRecordType.SWITCH}
			<ArrowLeftRight class="size-4" />
			<span>{record.value}</span>
		{:else if record.type === SearchRecordType.TRANSACTION}
			<Boxes class="size-4" />
			<span class="max-w-[13ch] truncate">
				{truncateCenter(record.value)}
			</span>
		{:else}
			<AppWindow class="size-4" />
			<span>{record.value}</span>
		{/if}
	</div>

	<span
		data-active={active}
		class="align-center truncate pr-2 text-right text-base font-medium text-nowrap text-inherit capitalize sm:block sm:pr-0 sm:text-left"
	>
		{#if record.description}
			{record.description}
		{:else}
			{m.search_view_type({ type: record.type })}
		{/if}
	</span>

	{@render children?.()}
</a>
