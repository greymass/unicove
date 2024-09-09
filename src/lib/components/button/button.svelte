<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLLinkAttributes } from 'svelte/elements';

	type HTMLAttributes = HTMLButtonAttributes & HTMLLinkAttributes;

	interface ButtonProps extends HTMLAttributes {
		href?: string;
		variant?: 'primary' | 'secondary' | 'pill';
		disabled?: boolean;
		active?: boolean;
		blank?: boolean;
		class?: string;
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let { class: className = '', onclick, ...props }: ButtonProps = $props();

	let ariaRole = props.href ? 'link' : 'button';

	let linkProps = $derived(() =>
		props.href && props.blank
			? {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			: {}
	);
</script>

<!-- [@media(any-hover:hover)]:hover:opacity-80 -->

{#if props.variant === 'pill'}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		data-active={props.active}
		class="
		relative
		inline-flex
		items-center
		justify-center
		text-nowrap
		rounded-full
		border-2
		border-transparent

		px-5
		py-2
		text-center
		text-base
		font-medium
		leading-4

		focus-visible:outline
		focus-visible:outline-2
		focus-visible:outline-solar-500

		data-[active=true]:border-mineShaft-200/30

		[@media(any-hover:hover)]:hover:text-mineShaft-100

		{className}"
		{onclick}
		role={ariaRole}
		{...props}
		{...linkProps}
	>
		<span class="pointer-events-none relative z-10 text-inherit">{@render props.children()}</span>
		<div
			class="absolute inset-0 rounded-[inherit] bg-mineShaft-900 opacity-0
			[@media(any-hover:hover)]:hover:opacity-100
			[@media(any-hover:hover)]:active:opacity-20
			[@media(any-hover:hover)]:active:transition-opacity"
		></div>
	</svelte:element>
{:else if props.variant === 'secondary'}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		disabled={props.disabled}
		class="
		relative
		flex
		grow
		items-center
		justify-center
		text-nowrap
		rounded-lg
		px-8
		py-3.5
		text-center
		text-base
		font-medium
		text-mineShaft-100

		ring-2
		ring-inset
		ring-mineShaft-600

		hover:ring-transparent
		focus-visible:outline
		focus-visible:outline-transparent

		focus-visible:ring-solar-500
		active:ring-transparent

		disabled:cursor-not-allowed
		disabled:text-mineShaft-400
		disabled:active:ring-mineShaft-600

		{className}
		"
		{onclick}
		role={ariaRole}
		{...props}
		{...linkProps}
	>
		<span class="pointer-events-none relative z-10">{@render props.children()}</span>
		<div
			class="absolute
inset-0
rounded-[inherit]
bg-mineShaft-900
opacity-0
[@media(any-hover:hover)]:hover:opacity-100
[@media(any-hover:hover)]:active:opacity-20
[@media(any-hover:hover)]:active:transition-opacity"
			class:hidden={props.disabled}
		></div>
	</svelte:element>
{:else}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		disabled={props.disabled}
		class="
		relative
		inline-flex
		grow
		items-center
		justify-center
		text-nowrap
		rounded-lg
		bg-skyBlue-500
		px-8
		py-3.5
		text-center
		text-base
		font-medium
		text-skyBlue-950
		transition-all

		focus:outline-transparent
		focus-visible:outline
		focus-visible:ring-2
		focus-visible:ring-inset
		focus-visible:ring-solar-500

		disabled:cursor-not-allowed
		disabled:bg-mineShaft-900
		disabled:text-white/60

		{className}
		"
		{onclick}
		role={ariaRole}
		{...props}
		{...linkProps}
	>
		<span class="pointer-events-none relative z-10">{@render props.children()}</span>
		<div
			class="absolute
inset-0
rounded-[inherit]
bg-white
opacity-0
transition-opacity
active:bg-black/30
			[@media(any-hover:hover)]:hover:opacity-20"
			class:hidden={props.disabled}
		></div>
	</svelte:element>
{/if}
