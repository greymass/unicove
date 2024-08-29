<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface TextInputProps extends HTMLInputAttributes {
		ref?: HTMLInputElement;
	}

	let { ref = $bindable(), value = $bindable(), ...props }: TextInputProps = $props();
</script>

<input
	class="rounded-lg border-2 border-mineShaft-600 bg-transparent px-4 py-4 font-medium focus:outline-none focus:ring focus:ring-inset focus:ring-blue-500"
	type="text"
	bind:this={ref}
	bind:value
	{...props}
/>
