<script>
	import { Stack } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
</script>

<Stack id="buttons">
	<h2 class="h2">Buttons</h2>
	<Stack class="items-start">
		<h3 class="h3">Primary</h3>
		<Button variant="primary" onclick={() => {}}>EOS (0)</Button>
	</Stack>
	<Stack class="items-start">
		<h3 class="h3">Secondary</h3>
		<Button variant="secondary" onclick={() => {}}>EOS (1)</Button>
	</Stack>
	<Stack class="items-start">
		<h3 class="h3">Pill</h3>
		<Button variant="pill" onclick={() => {}}>EOS (MAX)</Button>
	</Stack>
</Stack>
