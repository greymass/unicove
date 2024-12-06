<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface TextInputProps extends HTMLInputAttributes {
		ref?: HTMLInputElement;
		children?: Snippet;
	}

	let { ref = $bindable(), value = $bindable(), ...props }: TextInputProps = $props();
</script>

<div
	class="relative flex h-12 gap-2 rounded-lg border-2 border-mineShaft-600 px-4 *:content-center focus-within:border-skyBlue-500 focus-within:ring focus-within:ring-1 focus-within:ring-inset focus-within:ring-skyBlue-500"
>
	<input
		class="placeholder:text-muted w-full rounded-lg bg-transparent font-medium focus:outline-none"
		type="text"
		autocorrect="off"
		autocomplete="off"
		autocapitalize="off"
		bind:this={ref}
		bind:value
		{...props}
	/>

	<div class="text-muted select-none">
		{@render props.children?.()}
	</div>
</div>
