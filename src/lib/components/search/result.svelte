<script lang="ts">
	import { ArrowLeftRight, Box, Key, UserSearch, Wrench } from 'lucide-svelte';
	import type { ComponentProps } from 'svelte';

	import { RecordType, type Record } from '$lib/state/search.svelte';
	import { truncateCenter } from '$lib/utils';
	import type TextInput from '../input/text.svelte';

	interface ResultProps extends ComponentProps<typeof TextInput> {
		record: Record;
		onclick: (event: MouseEvent) => void;
	}

	let { record, onclick }: ResultProps = $props();
</script>

<a
	class="grid grid-cols-subgrid items-center focus-visible:outline-none focus-visible:ring focus-visible:ring-inset focus-visible:ring-solar-500 sm:col-span-2"
	href={record.url}
	{onclick}
>
	<div class="table-cell-styles ml-2 flex items-center gap-2 font-mono tabular-nums">
		{#if record.type === RecordType.ACCOUNT}
			<UserSearch class="size-4" />
			<span>{record.value}</span>
		{:else if record.type === RecordType.BLOCK}
			<Box class="size-4" />
			<span>{record.value}</span>
		{:else if record.type === RecordType.KEY}
			<Key class="size-4" />
			<span class="max-w-[12ch] truncate">
				{record.value}
			</span>
		{:else if record.type === RecordType.TRANSACTION}
			<ArrowLeftRight class="size-4" />
			<span class="max-w-[13ch] truncate">
				{truncateCenter(record.value)}
			</span>
		{:else}
			<Wrench class="size-4" />
			<span>{record.value}</span>
		{/if}
	</div>

	<span class="align-center text-muted hidden text-base font-medium capitalize sm:block">
		{#if record.description}
			{record.description}
		{:else}
			View {record.type}
		{/if}
	</span>
</a>
