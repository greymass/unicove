<script lang="ts">
	interface Props {
		options: { href: string; text: string; active: boolean }[];
	}
	const props: Props = $props();
</script>

<nav
	aria-label="account functions"
	class="flex items-start overflow-x-auto gap-5 border-y border-mineShaft-900/70"
>
	{#each props.options as option}
		<li
			aria-current={option.active && 'page'}
			class="list-none text-gray-500 first:ms-11 aria-[current=page]:text-white aria-[current=page]:border-b-2 aria-[current=page]:border-skyBlue-400"
		>
			<a href={option.href} class="text-nowrap block py-6">
				{option.text}
			</a>
		</li>
	{/each}
</nav>
