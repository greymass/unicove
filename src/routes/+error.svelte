<script lang="ts">
	import { page } from '$app/state';
	import { Stack } from '$lib/components/layout';
	import Generic404 from '$lib/components/errors/generic.svelte';
	import Button from '$lib/components/button/button.svelte';
</script>

<div class="mx-auto max-w-prose">
	<Stack class="py-8 text-center">
		<div class=" *:object-fit mx-auto max-w-prose *:size-full">
			<Generic404 />
		</div>
		<h1 class="h2">
			{#if page.error?.message}
				{page.error.message}
			{:else}
				Page not found
			{/if}
		</h1>

		<Button class="mx-auto max-w-fit" variant="primary" href="/">Go to Unicove</Button>
	</Stack>
</div>
