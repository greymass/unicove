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
		class=" border-mine-700 focus-visible:border-solar-500 focus-visible:outline-solar-500 disabled:border-mine-950 disabled:bg-mine-950 data-[state=checked]:disabled:border-mine-950 data-[state=checked]:disabled:bg-mine-950 text-on-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:hover:border-primary data-[state=checked]:hover:bg-primary/90 flex size-5 cursor-pointer appearance-none items-center justify-center rounded border border-solid bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:text-white/30"
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
