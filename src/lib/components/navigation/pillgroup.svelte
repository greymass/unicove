<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import type { ComponentProps } from 'svelte';

	interface Option extends Omit<ComponentProps<Button>, 'children'> {
		text: string;
	}

	interface Props {
		options: Option[];
		class?: string;
	}
	const { class: className, ...props }: Props = $props();
</script>

<menu aria-label="page functions" class={`flex flex-wrap gap-3 sm:self-end ${className}`}>
	{#each props.options as option}
		<Button variant="pill" {...option}>
			{option.text}
		</Button>
	{/each}
</menu>
