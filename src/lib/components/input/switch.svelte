<script lang="ts">
	import { createSwitch, melt } from '@melt-ui/svelte';
	import Label from './label.svelte';

	const {
		elements: { root, input },
	} = createSwitch();
</script>

<div class="flex items-center">
	<Label class="pr-4">Airplane mode</Label>
	<button
		use:melt={$root}
		class="relative outline outline-offset-1 outline-gray-700 h-4/5 ml-5 cursor-default rounded-full bg-black transition-colors data-[state=checked]:bg-magnum-950"
		id="airplane-mode"
		aria-labelledby="airplane-mode-label"
	>
		<span class="thumb block rounded-full bg-mineShaft-300 transition" />
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
    }
</style>