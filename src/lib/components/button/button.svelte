<script lang='ts'>
interface Props {
	href?: string;
	variant?: typeof variants;
	disabled?: boolean;
}

let props: Props = $props();

const primary = 'rounded-lg bg-blue-400 hover:bg-blue-300 active:bg-blue-500 transition-colors';
const secondary = 'rounded-lg outline outline-1 outline-slate-600 hover:bg-slate-800 hover:outline-none active:bg-slate-900';
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
	<slot />
</svelte:element>
