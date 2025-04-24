<script lang="ts">
	interface Option {
		text: string;
		active?: boolean;
		href: string;
	}

	interface Props {
		options: Option[];
		class?: string;
	}

	const props: Props = $props();
</script>

<nav
	aria-label="account functions"
	class="px-page border-outline-variant flex items-start gap-5 overflow-x-auto border-y"
>
	{#each props.options as option}
		<li class="text-muted list-none">
			<a
				aria-current={option.active && 'page'}
				href={option.href}
				class="focus-visible:outline-solar-500 aria-[current=page]:border-primary aria-[current=page]:text-on-surface block py-6 text-nowrap -outline-offset-2 focus-visible:outline focus-visible:outline-2 aria-[current=page]:border-b-2"
			>
				{option.text}
			</a>
		</li>
	{/each}
</nav>
<!-- focus-within:outline focus-within:outline-2 focus-within:outline-solar-500 focus-within:before:opacity-100 focus-within:before:transition-none \ -->
