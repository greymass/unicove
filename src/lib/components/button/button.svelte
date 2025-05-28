<script lang="ts">
	import { cn } from '$lib/utils';
	import { emptyMeltElement, melt, type AnyMeltElement } from '@melt-ui/svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLLinkAttributes } from 'svelte/elements';

	type HTMLAttributes = HTMLButtonAttributes & HTMLLinkAttributes;

	interface ButtonProps extends HTMLAttributes {
		href?: string;
		variant?: 'primary' | 'secondary' | 'text' | 'pill' | 'outlined';
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

	let linkProps = $derived.by(() =>
		props.href && props.blank
			? {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			: {}
	);

	const filledStyles =
		' inline-flex h-12 grow  rounded-lg bg-primary px-8  text-on-primary  focus:outline-transparent focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-solar-500  disabled:text-on-surface    disabled:bg-surface-container-highest ';

	const secondaryFilledStyles =
		'inline-flex h-12 grow rounded-lg bg-primary-container/60 dark:bg-primary-container/30 px-8 text-on-primary-container focus:outline-transparent focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-solar-500 disabled:bg-transparent disabled:text-on-surface disabled:-outline-offset-2 disabled:outline-2 disabled:outline-on-surface-variant';

	const outlinedStyles =
		' flex h-12 grow rounded-lg px-8  text-primary ring-2 ring-inset ring-outline-variant   focus-visible:outline-hidden focus-visible:ring-solar-500  hover:active:ring-outline-variant  disabled:text-on-surface  disabled:hover:bg-transparent disabled:hover:ring-on-surface/12 disabled:ring-on-surface/12  ';

	const pillStyles =
		' inline-flex h-10  rounded-full border-2 border-transparent px-5  leading-4  focus-visible:border-solar-500  focus-visible:outline-hidden   aria-[current]:border-outline-variant aria-[current]:focus-visible:border-solar-500';

	const textStyles =
		'inline-flex  h-10  rounded-lg px-3  text-primary   focus-visible:ring-inset focus-visible:ring-solar-500 focus-visible:outline-hidden focus-visible:ring  disabled:text-on-surface  disabled:hover:bg-transparent';

	let styles = {
		primary: filledStyles,
		outlined: outlinedStyles,
		secondary: secondaryFilledStyles,
		pill: pillStyles,
		text: textStyles
	};
</script>

<svelte:element
	this={tag}
	use:melt={$meltElement}
	class={cn(
		'group/button relative cursor-pointer items-center justify-center text-center text-base font-medium text-nowrap transition-opacity disabled:cursor-not-allowed disabled:opacity-30',
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
		class="state-layer pointer-events-none absolute inset-0 rounded-[inherit] bg-current opacity-0 transition-opacity group-hover/button:opacity-8 group-focus-visible/button:opacity-10 group-active/button:group-hover/button:opacity-16 group-disabled/button:hidden"
	></div>
	<span class="content-layer pointer-events-none relative text-inherit">
		{@render props.children()}
		<ExternalLink
			data-external={/^https?:\/\//.test(props.href || '')}
			class="mb-1 ml-1 hidden size-4 data-[external=true]:inline"
		/>
	</span>
</svelte:element>
