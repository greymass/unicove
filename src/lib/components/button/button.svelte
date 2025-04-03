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

	const filledStyles =
		' inline-flex h-12 grow    rounded-lg bg-primary px-8  text-on-primary  focus:outline-transparent focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-solar-500   disabled:bg-mine-900 disabled:text-white/60   ';

	const outlinedStyles =
		' flex h-12 grow    rounded-lg px-8  text-primary ring-2 ring-inset ring-mine-600   focus-visible:outline-hidden focus-visible:ring-solar-500  hover:active:ring-mine-900  disabled:text-mine-400  disabled:hover:bg-transparent disabled:hover:ring-mine-600 disabled:active:ring-mine-600 ';

	const pillStyles =
		' inline-flex h-10    rounded-full border-2 border-transparent px-5  leading-4  focus-visible:border-solar-500  focus-visible:outline-hidden   hover:active:bg-mine-950 aria-[current]:border-mine-200/30 aria-[current]:focus-visible:border-solar-500 hover:bg-mine-900 hover:text-mine-100';

	const textStyles =
		' flex h-12 grow    rounded-lg px-8  text-primary    focus-visible:outline-hidden focus-visible:ring-solar-500    disabled:text-mine-400  disabled:hover:bg-transparent  hover:text-sky-300';

	let styles = {
		primary: filledStyles,
		secondary: outlinedStyles,
		pill: pillStyles,
		tertiary: textStyles
	};
</script>

<svelte:element
	this={tag}
	use:melt={$meltElement}
	class={cn(
		'group relative cursor-pointer items-center justify-center text-center text-base font-medium text-nowrap transition-all disabled:cursor-default disabled:opacity-30',
		styles[variant],
		className
	)}
	role={ariaRole}
	aria-current={ariaCurrent}
	{disabled}
	{onclick}
	{...props}
	{...linkProps}
>
	<div
		class="state-layer pointer-events-none absolute inset-0 rounded-[inherit] bg-current opacity-0 transition-opacity group-hover:opacity-8 group-focus-visible:opacity-10 group-active:group-hover:opacity-16 group-disabled:hidden"
	></div>
	<span class="content-layer pointer-events-none relative text-inherit">
		{@render props.children()}
	</span>
</svelte:element>
