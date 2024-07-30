<script lang="ts">
	interface Props {
		disabled?: boolean;
		label?: string;
		checked?: boolean;
	}
	import { createSwitch, melt } from '@melt-ui/svelte';
	import Label from './label.svelte';

	const {
		elements: { root, input, options },
	} = createSwitch({ disabled: false });

	let props: Props = $props();
</script>

<div class="flex items-center">
	<Label class="pr-4">Airplane mode</Label>
	<button
		use:melt={$root}
		class="relative outline outline-2 outline-offset-1 outline-gray-700 h-4/5 ml-5 cursor-default rounded-full bg-zinc-900 transition-colors data-[state=checked]:bg-pictonBlue-500 focus-visible:outline-yellow-500 data-[state=checked]:outline-pictonBlue-500 data-[state=checked]:outline-offset-0 data-[state=checked]:hover:bg-sky-400 data-[state=checked]:hover:outline-sky-400 data-[state=checked]:focus-visible:outline-yellow-500"
		id="airplane-mode"
		aria-labelledby="airplane-mode-label"
	>
		<span class="thumb block rounded-full bg-neutral-400 transition" />
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
</style>