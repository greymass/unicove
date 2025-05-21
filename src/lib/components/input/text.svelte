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

	/** Set the input value from a parent */
	export function set(newValue: string | undefined) {
		value = newValue;
	}
</script>

<div
	class={cn(
		'border-outline-variant bg-surface focus-within:border-primary  relative flex h-12 gap-2 rounded-lg border-2 px-4 *:content-center    ',
		props.disabled && 'text-muted border-outline-variant',
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
