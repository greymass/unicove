<script lang="ts">
	import { cn } from '$lib/utils';
	import { emptyMeltElement, melt, type AnyMeltElement } from '@melt-ui/svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLLinkAttributes } from 'svelte/elements';

	type HTMLAttributes = HTMLButtonAttributes & HTMLLinkAttributes;

	interface ButtonProps extends HTMLAttributes {
		href?: string;
		variant?: 'primary' | 'secondary' | 'tertiary' | 'pill';
		disabled?: boolean;
		active?: boolean;
		blank?: boolean;
		class?: string;
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
		meltAction?: AnyMeltElement;
	}

	let {
		meltAction,
		onclick,
		variant = 'primary',
		active,
		class: className,
		disabled = false,
		...props
	}: ButtonProps = $props();

	const ariaRole = props.href ? undefined : 'button'; // undefined because anchor tag with role=link gives a warning
	const ariaCurrent = props['aria-current'] || active === false ? undefined : true; // removes aria-current if active===false
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

	const primaryStyles =
		'relative inline-flex h-12 grow items-center justify-center text-nowrap rounded-lg bg-skyBlue-700 px-8 text-center text-base font-medium text-skyBlue-50 transition-all focus:outline-transparent focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-solar-500 hover:active:bg-skyBlue-800 disabled:cursor-not-allowed disabled:bg-mineShaft-900 disabled:text-white/60 disabled:opacity-30 disabled:hover:bg-mineShaft-900 [@media(any-hover:hover)]:hover:bg-skyBlue-600';

	const secondaryStyles =
		'relative flex h-12 grow items-center justify-center text-nowrap rounded-lg px-8 text-center text-base font-medium text-skyBlue-400 ring-2 ring-inset ring-mineShaft-600 transition-all hover:ring-transparent focus-visible:outline-none focus-visible:ring-solar-500 hover:active:bg-mineShaft-950 hover:active:ring-mineShaft-900 disabled:cursor-not-allowed disabled:text-mineShaft-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:ring-mineShaft-600 disabled:active:ring-mineShaft-600 [@media(any-hover:hover)]:hover:bg-mineShaft-900';

	const pillStyles =
		'relative inline-flex h-10 items-center justify-center text-nowrap rounded-full border-2 border-transparent px-5 text-center text-base font-medium leading-4 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-solar-500 hover:active:bg-mineShaft-950 aria-[current]:border-mineShaft-200/30 [@media(any-hover:hover)]:hover:bg-mineShaft-900 [@media(any-hover:hover)]:hover:text-mineShaft-100';

	const tertiaryStyles =
		'relative flex h-12 grow items-center justify-center text-nowrap rounded-lg px-8 text-center text-base font-medium text-skyBlue-400    transition-all  focus-visible:outline-none focus-visible:ring-solar-500   disabled:cursor-not-allowed disabled:text-mineShaft-400 disabled:opacity-30 disabled:hover:bg-transparent  [@media(any-hover:hover)]:hover:text-skyBlue-300';

	let styles = {
		primary: primaryStyles,
		secondary: secondaryStyles,
		pill: pillStyles,
		tertiary: tertiaryStyles
	};
</script>

<svelte:element
	this={tag}
	use:melt={$meltElement}
	class={cn(styles[variant], className)}
	role={ariaRole}
	aria-current={ariaCurrent}
	{disabled}
	{onclick}
	{...props}
	{...linkProps}
>
	<span class="pointer-events-none relative text-inherit">{@render props.children()}</span>
</svelte:element>
