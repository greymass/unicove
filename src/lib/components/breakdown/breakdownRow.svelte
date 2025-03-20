<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { cn } from '$lib/utils';

	type BreakdownAction = {
		href: string;
		text: string;
		visible?: boolean;
	};

	interface Props {
		key: string;
		value: Asset | undefined;
		action?: BreakdownAction;
	}

	let { key, value, action }: Props = $props();

	const isTotal = key === 'Total';
</script>

<div
	class={cn(
		'col-span-full grid min-h-12 grid-cols-subgrid items-center gap-x-4 border-b border-mine-shaft-900 last:border-none ',
		isTotal && 'font-semibold'
	)}
>
	<div
		class="col-start-1 col-end-3 row-start-1 flex flex-col py-2 @xs:flex-row @xs:justify-between"
	>
		<div class="text-muted">{key}</div>
		<div class="text-white">
			<AssetText class="text-nowrap" variant="full" {value} />
		</div>
	</div>

	{#if action && action.visible}
		<div class="col-span-2 col-start-2 row-start-1 text-right @xs:col-span-1 @xs:col-start-3">
			<a
				class="inline-block h-12 content-center text-sky-blue-500 hover:text-sky-blue-400"
				href={action.href}
			>
				{action.text}
			</a>
		</div>
	{/if}
</div>
