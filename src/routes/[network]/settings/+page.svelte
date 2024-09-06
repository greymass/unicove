<script lang="ts">
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import { getSetting } from '$lib/state/settings.svelte';
	import Label from '$lib/components/input/label.svelte';

	let advancedMode = getSetting('advanced-mode', false);
	let debugMode = getSetting('debug-mode', false);

	$effect(() => {
		if (!advancedMode.value) {
			debugMode.value = false;
		}
	});
</script>

<Stack>
	<Pageheader title="Settings" subtitle="Configure Unicove" />

	<div>
		<Label for="language-select">Language Selector</Label>
		<LanguageSelect />
	</div>

	<div>
		<Label for="advanced-mode">Enable Advanced Mode</Label>
		<Checkbox id="advanced-mode" bind:checked={advancedMode.value} />
	</div>

	{#if advancedMode.value}
		<div>
			<Label for="debug-mode">Enable Debug Mode</Label>
			<Checkbox id="debug-mode" bind:checked={debugMode.value} />
		</div>
	{/if}
</Stack>
