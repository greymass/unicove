<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { cn } from '$lib/utils';
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

<menu aria-label="page functions" class={cn('flex flex-wrap gap-3 ', className)}>
	{#each props.options as option}
		<li>
			<Button variant="pill" active={option.active} href={option.href}>
				{option.text}
			</Button>
		</li>
	{/each}
</menu>
