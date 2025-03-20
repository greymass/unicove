<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface TextInputProps extends HTMLInputAttributes {
		ref?: HTMLInputElement;
		children?: Snippet;
	}

	let {
		ref = $bindable(),
		value = $bindable(),
		class: className,
		...props
	}: TextInputProps = $props();
</script>

<div
	class={cn(
		'relative flex h-12 gap-2 rounded-lg border-2 border-mine-600 px-4 *:content-center focus-within:border-sky-500 focus-within:ring-3 focus-within:ring-1 focus-within:ring-inset focus-within:ring-sky-500 ',
		props.disabled && 'text-muted border-mine-600/20',
		className
	)}
>
	<input
		class="placeholder:text-muted w-full rounded-lg bg-transparent font-medium focus:outline-hidden"
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
