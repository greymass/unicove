<script lang="ts">
	import { cn } from '$lib/utils';
	import { type Icon } from 'lucide-svelte';
	import type { HTMLButtonAttributes, HTMLLinkAttributes } from 'svelte/elements';
	import { emptyMeltElement, melt, type AnyMeltElement } from '@melt-ui/svelte';

	type HTMLAttributes = HTMLButtonAttributes & HTMLLinkAttributes;

	interface Props extends HTMLAttributes {
		href?: string;
		disabled?: boolean;
		active?: boolean;
		blank?: boolean;
		class?: string;
		onclick?: (event: MouseEvent) => void;
		meltAction?: AnyMeltElement;
		icon: typeof Icon;
		size?: 'large' | 'small';
		variant?: 'filled' | 'standard';
	}

	let {
		meltAction,
		onclick,
		active,
		disabled = false,
		size = 'small',
		variant = 'standard',
		class: className,
		...props
	}: Props = $props();

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
</script>

<svelte:element
	this={tag}
	use:melt={$meltElement}
	data-size={size}
	class={cn(
		'touch-target group  focus-visible:text-solar-500 relative grid size-10  cursor-pointer place-items-center transition-all  *:col-start-1  *:row-start-1   focus-visible:outline-hidden disabled:cursor-default disabled:opacity-30  disabled:hover:bg-transparent  data-[size=large]:size-12 md:size-fit',
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
		data-variant={variant}
		class="state-layer bg-mine-500 pointer-events-none size-8 rounded-full opacity-0 transition-opacity group-hover:opacity-8 group-focus-visible:opacity-10 group-active:group-hover:opacity-16 group-disabled:hidden group-data-[size=large]:size-10 data-[variant=filled]:opacity-8"
	></div>

	{#if props.icon}
		{@const IconComponent = props.icon}
		<IconComponent class="pointer-events-none z-50 size-4 group-data-[size=large]:size-6" />
	{/if}
</svelte:element>
