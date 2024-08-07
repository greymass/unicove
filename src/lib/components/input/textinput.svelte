<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	interface TextInputProps extends HTMLInputAttributes {}

	let { value = $bindable(), ...props }: TextInputProps = $props();
</script>

<input
	class="rounded-lg bg-transparent px-4 py-4 font-medium outline outline-1 outline-gray-700 focus:outline-none focus:ring focus:ring-inset focus:ring-blue-500"
	type="text"
	{value}
	{...props}
/>
