<script lang="ts">
	import Switch from '$lib/components/input/switch.svelte';
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

<Stack class="">
	<Pageheader title="Settings" subtitle="Configure Unicove" />

	<div class="grid max-w-screen-sm auto-rows-fr gap-4">
		<div class="flex items-center justify-between">
			<Label for="language-select">Language Selector</Label>
			<LanguageSelect />
		</div>

		<div class="flex items-center justify-between">
			<Label for="advanced-mode">Enable Advanced Mode</Label>
			<Switch id="advanced-mode" bind:checked={advancedMode.value} />
		</div>

		{#if advancedMode.value}
			<div class="flex items-center justify-between">
				<Label for="debug-mode">Enable Debug Mode</Label>
				<Switch id="debug-mode" bind:checked={debugMode.value} />
			</div>
		{/if}
	</div>
</Stack>
