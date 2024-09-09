<script lang="ts">
	import { createSwitch, melt, createSync } from '@melt-ui/svelte';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';

	interface Props {
		disabled?: boolean;
		required?: boolean;
		checked: boolean;
		name?: string;
		value?: string;
		onCheckedChange?: ChangeFn<boolean>;
		id: string;
	}

	let {
		disabled = $bindable(false),
		checked = $bindable(false),
		required = false,
		name,
		value,
		onCheckedChange,
		id
	}: Props = $props();

	const {
		elements: { root, input },
		states
	} = createSwitch({
		disabled,
		required,
		defaultChecked: checked,
		onCheckedChange,
		value,
		name
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
		relative
		h-5
		rounded-full
		border
		border-mineShaft-700
		bg-transparent
		focus-visible:border-solar-500
		focus-visible:outline
		focus-visible:outline-2
		focus-visible:outline-offset-[-2px]
		focus-visible:outline-solar-500
		disabled:cursor-not-allowed
		disabled:bg-mineShaft-700
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
		<span class="thumb block rounded-full bg-mineShaft-200 transition"></span>
	</button>
	<input use:melt={$input} />
</div>

<style>
	button {
		/* Width of the track */
		--w: 36px;
		width: var(--w);
	}

	.thumb {
		/* Size of the thumb */
		--size: 16px;
		width: var(--size);
		height: var(--size);
		transform: translateX(1px);
	}

	:global([data-state='checked']) .thumb {
		transform: translateX(calc(var(--w) - (var(--size) + 3px)));
		background-color: white;
	}

	:global(button[data-disabled='true']) .thumb {
		background-color: theme('colors.mineShaft.300');
	}
</style>
