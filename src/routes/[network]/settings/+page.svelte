<script lang="ts">
	import LanguageSelect from '$lib/components/select/language.svelte';
	import { getSetting } from '$lib/state/settings.svelte';

	let advancedMode = getSetting('advanced-mode', false);
	let debugMode = getSetting('debug-mode', false);

	function toggleAdvanced() {
		// Toggle the advanced mode
		advancedMode.value = !advancedMode.value;

		// If disabling advanced, also disable any advanced settings that may be on
		if (!advancedMode.value) {
			debugMode.value = false;
		}
	}
</script>

<p>Language Selector</p>
<LanguageSelect />

<label for="advanced-mode"> Enable Advanced Mode </label>
<input id="advanced-mode" type="checkbox" checked={advancedMode.value} on:change={toggleAdvanced} />

{#if advancedMode.value}
	<div>
		<label for="debug-mode"> Enable Debug Mode </label>
		<input id="debug-mode" type="checkbox" bind:checked={debugMode.value} />
	</div>
{/if}
