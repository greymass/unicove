<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface TextInputProps extends HTMLInputAttributes {
		ref?: HTMLInputElement;
	}

	let { ref = $bindable(), value = $bindable(), ...props }: TextInputProps = $props();
</script>

<div class="relative">
	<input
		class="
			h-12
			w-full
			rounded-lg
			border-2
			border-mineShaft-600
			bg-transparent
			px-4
			font-medium
			focus:border-skyBlue-500
			focus:outline-none
			focus:ring
			focus:ring-1
			focus:ring-inset
			focus:ring-skyBlue-500"
		type="text"
		autocorrect="off"
		autocomplete="off"
		autocapitalize="off"
		bind:this={ref}
		bind:value
		{...props}
	/>
</div>
