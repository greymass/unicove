<script lang="ts">
	import Switch from '$lib/components/input/switch.svelte';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { Stack } from '$lib/components/layout';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import Code from '$lib/components/code.svelte';

	const context = getContext<UnicoveContext>('state');

	let preventAccountPageSwitching = $state(!!context.settings.data.preventAccountPageSwitching);
	let searchAccountSwitch = $state(!!context.settings.data.searchAccountSwitch);
	let searchShowPages = $state(!!context.settings.data.searchShowPages);
	let advancedMode = $state(!!context.settings.data.advancedMode);
	let debugMode = $state(!!context.settings.data.debugMode);

	$effect(() => {
		context.settings.data = {
			advancedMode,
			preventAccountPageSwitching,
			searchAccountSwitch,
			searchShowPages,
			// Override debug mode if advanced mode is disabled
			debugMode: advancedMode ? debugMode : false
		};
	});
</script>

<div class="grid max-w-screen-sm auto-rows-fr gap-6">
	<div class="flex items-center justify-between">
		<h2 class="text-muted text-xl font-semibold">General</h2>
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="language-select">Language Selector</Label>
			<!-- <p class="caption text-sm">Choose a language</p> -->
		</Stack>
		<LanguageSelect />
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="search-show-pages">Allow page navigation in search prompt</Label>
			<p class="caption text-sm">Adds popular Unicove pages to search results.</p>
		</Stack>
		<Switch id="search-show-pages" bind:checked={searchShowPages} />
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="search-account-switch">Allow account switching in search prompt</Label>
			<p class="caption text-sm">Adds logged in accounts to search results for quick switching.</p>
		</Stack>
		<Switch id="search-account-switch" bind:checked={searchAccountSwitch} />
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="prevent-account-page-switching"
				>Remain on current page when switching accounts</Label
			>
			<p class="caption text-sm">Prevents the automatic navigation to the account overview page</p>
		</Stack>
		<Switch id="prevent-account-page-switching" bind:checked={preventAccountPageSwitching} />
	</div>

	<div class="flex items-center justify-between">
		<h2 class="text-muted text-xl font-semibold">Advanced</h2>
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="advanced-mode">Enable Advanced Options</Label>
			<p class="caption text-sm">Manage network resources, enhanced asset precision, etc.</p>
		</Stack>
		<Switch id="advanced-mode" bind:checked={advancedMode} />
	</div>

	{#if advancedMode}
		<div class="flex items-center justify-between">
			<h2 class="text-muted text-xl font-semibold">Developer</h2>
		</div>
		<div class="flex items-center justify-between">
			<Stack class="gap-1">
				<Label for="debug-mode">Enable Debug Mode</Label>
				<p class="caption text-sm">Show raw data used for development and debugging</p>
			</Stack>
			<Switch id="debug-mode" bind:checked={debugMode} />
		</div>
	{/if}
</div>
{#if debugMode}
	<Code>{JSON.stringify(context.settings.data, null, 2)}</Code>
{/if}
