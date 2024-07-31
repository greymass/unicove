<script lang="ts">
	interface Props {
		isDisabled?: boolean;
		isChecked?: boolean;
	}

	import { createSwitch, melt } from '@melt-ui/svelte';

	// Extracting props with default values
	let { isDisabled = false, isChecked = false }: Props = $props();

	const {
		elements: { root, input }
	} = createSwitch({
		disabled: isDisabled,
		defaultChecked: isChecked
	});
</script>

<div class="flex items-center">
	<button
		use:melt={$root}
		class="relative outline outline-2 outline-offset-1 outline-gray-700 h-4/5 cursor-default rounded-full bg-zinc-900 transition-colors disabled:outline-offset-0 disabled:bg-gray-700 data-[state=checked]:bg-sky-500 focus-visible:outline-yellow-500 data-[state=checked]:outline-sky-500 data-[state=checked]:outline-offset-0 data-[state=checked]:hover:bg-sky-400 data-[state=checked]:hover:outline-sky-400 data-[state=checked]:focus-visible:outline-yellow-500"
		id="airplane-mode"
		aria-labelledby="airplane-mode-label"
	>
		<span class="block rounded-full bg-neutral-400 transition thumb" />
	</button>
	<input use:melt={$input} />
</div>

<style>
	button {
		--w: 2.25rem;
		--padding: 0.01rem;
		width: var(--w);
	}

	.thumb {
		--size: 1rem;
		width: var(--size);
		height: var(--size);
		transform: translateX(var(--padding));
	}

	:global([data-state='checked']) .thumb {
		transform: translateX(calc(var(--w) - var(--size) - var(--padding)));
		background-color: white;
	}

	:global(button[data-disabled='true']) .thumb {
		background-color: white;
	}
</style>
