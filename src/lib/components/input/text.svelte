<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface TextInputProps extends HTMLInputAttributes {
		ref?: HTMLInputElement;
		rightText?: string;
	}

	let {
		ref = $bindable(),
		value = $bindable(),
		rightText = '',
		...props
	}: TextInputProps = $props();
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
			focus:ring-skyBlue-500
			{rightText ? 'pr-12' : ''}"
		type="text"
		bind:this={ref}
		bind:value
		{...props}
	/>
	{#if rightText}
		<span
			class="
				pointer-events-none
				absolute
				inset-y-0
				right-0
				flex
				items-center
				pr-4
				text-gray-500"
		>
			{rightText}
		</span>
	{/if}
</div>
