<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import Check from 'lucide-svelte/icons/check';

	import type { Readable } from 'svelte/store';
	import type { ExtendedSelectOption } from '../types';

	interface Props {
		variant?: 'pill' | 'form';
		id: string;
		// Upstream bug: https://github.com/melt-ui/melt-ui/issues/974
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		option: any;
		item: ExtendedSelectOption;
		isSelected: Readable<(value: unknown) => boolean>;
	}

	const { option, isSelected, ...props }: Props = $props();
</script>

<div
	class="
	hover:bg-solar-500
	focus:text-solar-950
	data-[highlighted=true]:bg-solar-500
	data-[highlighted=true]:text-solar-950
	relative
	grid
	cursor-pointer
	grid-cols-[16px_1fr]
	items-center
	gap-2
	rounded-xl
	px-2
	py-1
	font-medium
	hover:text-black/95
	focus:z-10
	data-disabled:opacity-50
	data-[variant=form]:rounded-xs
	data-[variant=pill]:rounded-xl
	"
	data-variant={props.variant}
	use:melt={$option(props.item)}
>
	{#if props.item.image && typeof props.item.image === 'string'}
		<img src={props.item.image} alt={props.item.label} class="mr-2 size-4 object-contain" />
	{:else}
		<div class="check">
			<Check class="size-4 {$isSelected(props.item.value) ? 'block' : 'hidden'}" />
		</div>
	{/if}
	{props.item.label}
</div>
