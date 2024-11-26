<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import AssetText from '$lib/components/elements/asset.svelte';

	type BreakdownAction = {
		href: string;
		text: string;
	};

	interface Props {
		key: string;
		value: Asset | undefined;
		action?: BreakdownAction;
		shouldShowAction?: boolean;
	}

	let { key, value, action, shouldShowAction = false }: Props = $props();
</script>

<div
	data-is-total={key === 'Total'}
	class="grid min-h-12 grid-cols-2 items-center gap-x-4 border-b border-mineShaft-900 last:border-none data-[is-total=true]:font-semibold @xs:grid-cols-3"
>
	<div class="flex flex-col flex-wrap py-2 @xs:col-span-2 @xs:flex-row @xs:justify-between">
		<div class="text-muted">{key}</div>
		<div class="text-white">
			<AssetText class="text-nowrap" variant="full" {value} />
		</div>
	</div>

	{#if shouldShowAction && action}
		<div class="text-right">
			<a
				class="inline-block h-12 content-center text-skyBlue-500 hover:text-skyBlue-400"
				href={action.href}
			>
				{action.text}
			</a>
		</div>
	{/if}
</div>
