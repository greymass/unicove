<script lang="ts">
	import { emptyMeltElement, melt, type AnyMeltElement } from '@melt-ui/svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLLinkAttributes } from 'svelte/elements';

	type HTMLAttributes = HTMLButtonAttributes & HTMLLinkAttributes;

	interface ButtonProps extends HTMLAttributes {
		href?: string;
		variant?: 'primary' | 'secondary' | 'pill' | 'outline';
		disabled?: boolean;
		active?: boolean;
		blank?: boolean;
		class?: string;
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
		meltAction?: AnyMeltElement;
	}

	let {
		class: className = '',
		meltAction,
		onclick,
		variant = 'primary',
		active = false,
		disabled = false,
		...props
	}: ButtonProps = $props();

	const ariaRole = props.href ? 'link' : 'button';
	const tag = props.href ? 'a' : 'button';

	// Only use melt builder element if passed as a prop
	let meltElement = $derived(meltAction ?? emptyMeltElement);

	let linkProps = $derived(() =>
		props.href && props.blank
			? {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			: {}
	);
</script>

<svelte:element
	this={tag}
	use:melt={$meltElement}
	data-active={active}
	data-variant={variant}
	class={className}
	role={ariaRole}
	{disabled}
	{onclick}
	{...props}
	{...linkProps}
>
	<span class="button-text">{@render props.children()}</span>
	<div class="button-backdrop" class:hidden={disabled}></div>
</svelte:element>

<style>
	.button-text {
		@apply pointer-events-none relative z-10 text-inherit;
	}

	[data-variant='pill'] {
		@apply relative inline-flex items-center justify-center text-nowrap rounded-full border-2 border-transparent px-5 py-2 text-center text-base font-medium leading-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-solar-500 data-[active=true]:border-mineShaft-200/30 [@media(any-hover:hover)]:hover:text-mineShaft-100;
	}

	[data-variant='secondary'] {
		@apply relative flex grow items-center justify-center text-nowrap rounded-lg px-8 py-3.5 text-center text-base font-medium text-mineShaft-100 ring-2 ring-inset ring-mineShaft-600 hover:ring-transparent focus-visible:outline focus-visible:outline-transparent focus-visible:ring-solar-500 active:ring-transparent disabled:cursor-not-allowed disabled:text-mineShaft-400 disabled:hover:ring-mineShaft-600 disabled:active:ring-mineShaft-600;
	}

	[data-variant='primary'] {
		@apply relative inline-flex grow items-center justify-center text-nowrap rounded-lg bg-skyBlue-500 px-8 py-3.5 text-center text-base font-medium text-skyBlue-950 transition-all focus:outline-transparent focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-solar-500 disabled:cursor-not-allowed disabled:bg-mineShaft-900 disabled:text-white/60;
	}

	[data-variant='outline'] {
		@apply relative flex grow items-center justify-center text-nowrap rounded-lg bg-transparent px-8 py-3.5 text-center text-base font-medium text-skyBlue-500 ring-1 ring-inset ring-mineShaft-600 hover:bg-mineShaft-900/20 focus-visible:outline focus-visible:outline-transparent focus-visible:ring-solar-500 active:bg-mineShaft-900/30 disabled:cursor-not-allowed disabled:text-mineShaft-400 disabled:hover:ring-mineShaft-600 disabled:active:ring-mineShaft-600;
	}

	.button-backdrop {
		@apply absolute inset-0 rounded-[inherit] opacity-0;
	}

	[data-variant='pill'] .button-backdrop,
	[data-variant='secondary'] .button-backdrop {
		@apply bg-mineShaft-900 [@media(any-hover:hover)]:hover:opacity-100 [@media(any-hover:hover)]:active:opacity-20 [@media(any-hover:hover)]:active:transition-opacity;
	}
	[data-variant='primary'] .button-backdrop {
		@apply bg-white transition-opacity active:bg-black/30 [@media(any-hover:hover)]:hover:opacity-20;
	}
</style>
