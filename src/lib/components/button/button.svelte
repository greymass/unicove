<script lang='ts'>
interface Props {
	href?: string;
	variant?: 'primary' | 'secondary';
}

let props: Props = $props();

const variants = {
	primary: 'bg-blue-400 hover:bg-blue-300 active:bg-blue-500',
	secondary: 'outline outline-1 outline-slate-600 hover:bg-slate-800 hover:outline-none active:bg-slate-900',
};

// Default to primary if variant is not defined
const variantStyles = variants[props.variant] || variants.primary;

</script>

<svelte:element
	this={props.href ? 'a' : 'button'}
	class={ `py-2 px-8 rounded-lg text-white font-bold transition-all ${variantStyles}` }
	{...props}
>
	<slot />
</svelte:element>
