<script lang='ts'>
interface Props {
	href?: string;
	variant?: typeof variants;
	disabled?: boolean;
}

let props: Props = $props();

const primary = 'rounded-lg relative bg-pictonBlue-600 \
	before:absolute before:opacity-20 before:bg-white hover:before:opacity-30 before:rounded-md before:inset-0 before:transition-opacity before:active:opacity-0 ';
const secondary = 'rounded-lg outline outline-1 outline-slate-600 hover:bg-slate-800 hover:outline-slate-800 active:bg-slate-900';
const pill = 'rounded-full hover:bg-slate-800 active:bg-slate-900 target:outline target:outline-1 target:outline-slate-600';

const variants = {
	primary,
	secondary,
	pill
};

// Default to primary if variant is not defined
const variantStyles = variants[props.variant] || variants.primary;

</script>

<svelte:element
	this={props.href ? 'a' : 'button'}
	class={ `py-2 px-8 text-white font-medium  ${variantStyles}` }
	{...props}
>
	<span class="relative z-10">{@render props.children()}</span>
</svelte:element>
