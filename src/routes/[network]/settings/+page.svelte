<script lang="ts">
	import Switch from '$lib/components/input/switch.svelte';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import { getSetting } from '$lib/state/settings.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { Stack } from '$lib/components/layout';

	let advancedMode = getSetting('advanced-mode', false);
	let debugMode = getSetting('debug-mode', false);
	let preventAccountPageSwitching = getSetting('prevent-account-page-switching', false);

	$effect(() => {
		if (!advancedMode.value) {
			debugMode.value = false;
		}
	});
</script>

<div class="grid max-w-screen-sm auto-rows-fr gap-6">
	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="language-select">Language Selector</Label>
			<!-- <p class="caption text-sm">Choose a language</p> -->
		</Stack>
		<LanguageSelect />
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="advanced-mode">Enable Advanced Mode</Label>
			<p class="caption text-sm">
				View Resources, Enhanced asset precision, extra options and more
			</p>
		</Stack>
		<Switch id="advanced-mode" bind:checked={advancedMode.value} />
	</div>

	{#if advancedMode.value}
		<div class="flex items-center justify-between">
			<Stack class="gap-1">
				<Label for="debug-mode">Enable Debug Mode</Label>
				<p class="caption text-sm">Show raw data used for development and debugging</p>
			</Stack>
			<Switch id="debug-mode" bind:checked={debugMode.value} />
		</div>

		<div class="flex items-center justify-between">
			<Stack class="gap-1">
				<Label for="advanced-mode">Prevent navigation on account switching</Label>
				<p class="caption text-sm">
					Stay on the current page instead of navigating to account overview
				</p>
			</Stack>
			<Switch id="advanced-mode" bind:checked={preventAccountPageSwitching.value} />
		</div>
	{/if}
</div>
