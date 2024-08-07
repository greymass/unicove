<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	interface TextInputProps extends HTMLInputAttributes {}

	let { value = $bindable(), ...props }: TextInputProps = $props();
</script>

<input
	class="py-4 px-4 rounded-lg bg-transparent outline outline-1 outline-gray-700 focus:outline-none focus:ring focus:ring-inset focus:ring-blue-500 font-medium"
	type="text"
	{value}
	{...props}
/>
