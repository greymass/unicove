<script lang="ts">
	import { createCheckbox, melt, createSync } from '@melt-ui/svelte';
	import Check from 'lucide-svelte/icons/check';
	import Minus from 'lucide-svelte/icons/minus';

	interface Props {
		disabled?: boolean;
		required?: boolean;
		checked: boolean | 'indeterminate';
		name?: string;
		value?: string;
		id: string;
	}

	let {
		disabled = $bindable(false),
		checked = $bindable(false),
		required = false,
		name,
		value,
		id
	}: Props = $props();

	const {
		elements: { root, input },
		states
	} = createCheckbox({
		defaultChecked: checked,
		disabled,
		name,
		value,
		required
	});

	const sync = createSync(states);
	$effect(() => {
		sync.checked(checked, (v) => (checked = v));
	});

	const ariaLabelledBy = `${id}-label`;
</script>

<div class="flex items-center">
	<button
		use:melt={$root}
		class="
			flex
			size-5
			appearance-none
			items-center
			justify-center
			rounded
			border
			border-solid
			border-mineShaft-700
			bg-transparent
		text-skyBlue-950
			focus-visible:border-solar-500
			focus-visible:outline
			focus-visible:outline-2
			focus-visible:outline-offset-[-2px]
			focus-visible:outline-solar-500
			disabled:cursor-not-allowed
		disabled:border-mineShaft-950
		disabled:bg-mineShaft-950
			disabled:text-white/30
			data-[state=checked]:border-skyBlue-500
			data-[state=checked]:bg-skyBlue-500
			data-[state=checked]:hover:border-skyBlue-400
			data-[state=checked]:hover:bg-skyBlue-400
			data-[state=checked]:disabled:border-mineShaft-950
			data-[state=checked]:disabled:bg-mineShaft-950
			"
		{id}
		aria-labelledby={ariaLabelledBy}
	>
		{#if checked === true}
			<Check class="size-3.5 stroke-[3.5px]" />
		{:else if checked === 'indeterminate'}
			<Minus class="size-3.5 stroke-[3.5px] text-white/30" />
		{/if}
		<input use:melt={$input} />
	</button>
</div>
