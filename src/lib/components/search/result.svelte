<script lang="ts">
	import { ArrowLeftRight, Box, Key, UserSearch } from 'lucide-svelte';
	import type { ComponentProps } from 'svelte';

	import type { SearchResult } from '$lib/state/search.svelte';
	import { truncateCenter } from '$lib/utils';
	import type TextInput from '../input/text.svelte';

	interface ResultProps extends ComponentProps<typeof TextInput> {
		item: SearchResult;
		onclick: (event: MouseEvent) => void;
	}

	let { item, onclick }: ResultProps = $props();
</script>

<a
	class="grid grid-cols-subgrid items-center focus-visible:outline-none focus-visible:ring focus-visible:ring-inset focus-visible:ring-solar-500 sm:col-span-2"
	href={item.result}
	{onclick}
>
	<div class="table-cell-styles ml-2 flex items-center gap-2 font-mono tabular-nums">
		{#if item.searchType === 'account'}
			<UserSearch class="size-4" />
			<span>{item.searchValue}</span>
		{:else if item.searchType === 'block'}
			<Box class="size-4" />
			<span>{item.searchValue}</span>
		{:else if item.searchType === 'key'}
			<Key class="size-4" />
			<span class="max-w-[12ch] truncate">
				{item.searchValue}
			</span>
		{:else if item.searchType === 'transaction'}
			<ArrowLeftRight class="size-4" />
			<span class="max-w-[13ch] truncate">
				{truncateCenter(item.searchValue)}
			</span>
		{/if}
	</div>

	<span class="align-center text-muted hidden text-base font-medium capitalize sm:block"
		>{item.searchType}</span
	>
</a>
