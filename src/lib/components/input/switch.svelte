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
		{id}
		use:melt={$root}
		class=" border-outline *:bg-outline focus-visible:border-solar-500 focus-visible:outline-solar-500 data-[state=checked]:*:bg-on-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:hover:bg-primary/90 data-[state=checked]:hover:border-primary/90 relative h-8 w-[52px] rounded-full border-2 bg-transparent *:size-4 *:translate-x-1.5 *:transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:*:translate-x-[26px] data-[state=checked]:*:scale-150"
		aria-labelledby={ariaLabelledBy}
	>
		<span class="thumb block rounded-full"></span>
	</button>
	<input use:melt={$input} />
</div>
