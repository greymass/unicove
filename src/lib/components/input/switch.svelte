<script lang="ts">
	import { createSwitch, melt } from '@melt-ui/svelte';
	import { writable, type Writable } from 'svelte/store';
	import { onDestroy } from 'svelte';

	interface Props {
		isDisabled?: boolean;
		isChecked?: boolean;
		name: string;
		id: string;
	}

	let { isDisabled = false, isChecked = false, name, id = 'default-switch-id' }: Props = $props();

	// Create writable store to manage checked state
	const checked: Writable<boolean> = writable(isChecked);

	const {
		elements: { root, input },
		states: { checked: meltChecked }
	} = createSwitch({
		disabled: isDisabled,
		defaultChecked: isChecked
	});

	const ariaLabelledBy = `${id}-label`;

	$effect(() => {
		checked.set($meltChecked);
	});

	// Subscribe to changes in checked store and dispatch custom event
	const unsubscribe = checked.subscribe((value) => {
		if (typeof window !== 'undefined') {
			const event = new CustomEvent('switchChange', {
				detail: { id, checked: value },
				bubbles: true,
				composed: true
			});
			window.dispatchEvent(event);
		}
	});

	onDestroy(() => {
		unsubscribe();
	});

	// Export checked store for external use
	export { checked };
</script>

<div class="flex items-center">
	<button
		use:melt={$root}
		class="
		relative
		ring
		ring-offset-1
		ring-gray-700
		ring-offset-transparent
		h-4/5
		cursor-default
		rounded-full
		bg-transparent
		transition-colors
		disabled:bg-gray-700
		disabled:ring-offset-gray-700
		data-[state=checked]:bg-sky-500
		data-[state=checked]:ring-offset-sky-500
		data-[state=checked]:ring-sky-500
		data-[state=checked]:hover:bg-sky-400
		data-[state=checked]:hover:ring-sky-400
		data-[state=checked]:hover:ring-offset-sky-400
		focus-visible:outline
		focus-visible:outline-2
		focus-visible:outline-offset-2
		focus-visible:outline-solar-500
		focus-visible:ring-solar-500
		focus-visible:ring-offset-solar-500
		data-[state=checked]:focus-visible:ring-solar-500
		data-[state=checked]:focus-visible:ring-offset-solar-500
"
		{id}
		aria-labelledby={ariaLabelledBy}
	>
		<span class="block rounded-full bg-neutral-400 transition thumb"></span>
	</button>
	<input use:melt={$input} {name} />
</div>

<style>
	button {
		--w: 2.25rem;
		--padding: 0.001rem;
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
