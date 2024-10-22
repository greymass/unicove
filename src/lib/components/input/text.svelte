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
			w-full
			rounded-lg
			border-2
			border-mineShaft-600
			bg-transparent
			px-4
			py-4
			font-medium
			focus:border-skyBlue-500
			focus:outline-none
			focus:ring
			focus:ring-1
			focus:ring-inset
			focus:ring-skyBlue-500"
		type="text"
		bind:this={ref}
		bind:value
		{...props}
	/>
</div>
