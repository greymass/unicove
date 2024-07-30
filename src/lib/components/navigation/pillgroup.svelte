<script lang="ts">
	import { createRadioGroup, melt } from '@melt-ui/svelte';
	import Button from '$lib/components/button/button.svelte';

	interface Props {
		options: string[];
	}
	const props: Props = $props();

	const {
		elements: { root, item, hiddenInput },
		helpers: { isChecked }
	} = createRadioGroup({
		defaultValue: props.options[0],
		orientation: 'horizontal'
	});
</script>

<div use:melt={$root} aria-label="page functions" class="flex flex-wrap gap-3">
	{#each props.options as option}
		<span class="contents" use:melt={$item(option)}>
			<Button variant="pill" active={$isChecked(option)}>
				{option}
			</Button>
		</span>
	{/each}
</div>
