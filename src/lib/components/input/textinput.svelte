<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	interface TextInputProps extends HTMLInputAttributes {}

	let { value = $bindable(), ...props }: TextInputProps = $props();
</script>

<input
	class="
	rounded-lg
bg-transparent
px-4
py-4
font-medium
outline
outline-1
outline-gray-700
invalid:outline-red-600
focus:outline-none
focus:ring
focus:ring-inset
focus:ring-blue-500
focus:invalid:ring-red-600
	"
	type="text"
	bind:value
	{...props}
/>
