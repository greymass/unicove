<script lang="ts">
	import { createRadioGroup, melt } from '@melt-ui/svelte';
	import Button from '$lib/components/button/button.svelte';
	const {
		elements: { root, item, hiddenInput },
		helpers: { isChecked }
	} = createRadioGroup({
		defaultValue: 'overview'
	});

	const optionsArr = ['overview', 'stake', 'unstake', 'withdraw'];
</script>

<div use:melt={$root} aria-label="page functions" class="flex flex-wrap gap-3">
	{#each optionsArr as option}
		<span class="contents" use:melt={$item(option)}>
			<Button variant="pill" active={$isChecked(option)}>
				{option}
			</Button>
		</span>
	{/each}
</div>
