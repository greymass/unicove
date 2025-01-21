<script lang="ts">
	import Switch from '$lib/components/input/switch.svelte';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { Stack } from '$lib/components/layout';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import Code from '$lib/components/code.svelte';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');

	let preventAccountPageSwitching = $state(!!context.settings.data.preventAccountPageSwitching);
	let searchAccountSwitch = $state(!!context.settings.data.searchAccountSwitch);
	let searchShowPages = $state(!!context.settings.data.searchShowPages);
	let advancedMode = $state(!!context.settings.data.advancedMode);
	let debugMode = $state(!!context.settings.data.debugMode);
	let hideSideMenu = $state(!!context.settings.data.hideSideMenu);

	$effect(() => {
		context.settings.data = {
			advancedMode,
			preventAccountPageSwitching,
			searchAccountSwitch,
			searchShowPages,
			// Override debug mode if advanced mode is disabled
			debugMode: advancedMode ? debugMode : false,
			hideSideMenu
		};
	});
</script>

<div class="grid max-w-screen-sm auto-rows-fr gap-6">
	<div class="flex items-center justify-between">
		<h2 class="text-muted text-xl font-semibold">{m.settings_general()}</h2>
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="language-select">{m.settings_language_selector()}</Label>
			<!-- <p class="caption text-sm">Choose a language</p> -->
		</Stack>
		<LanguageSelect />
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="search-show-pages">{m.settings_search_show_pages()}</Label>
			<p class="caption text-sm">{m.settings_search_show_pages_desc()}</p>
		</Stack>
		<Switch id="search-show-pages" bind:checked={searchShowPages} />
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="search-account-switch">{m.settings_search_account_switch()}</Label>
			<p class="caption text-sm">{m.settings_search_account_switch_desc()}</p>
		</Stack>
		<Switch id="search-account-switch" bind:checked={searchAccountSwitch} />
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="prevent-account-page-switching"
				>{m.settings_prevent_account_page_switching()}</Label
			>
			<p class="caption text-sm">{m.settings_prevent_account_page_switching_desc()}</p>
		</Stack>
		<Switch id="prevent-account-page-switching" bind:checked={preventAccountPageSwitching} />
	</div>

	<div class="flex items-center justify-between">
		<h2 class="text-muted text-xl font-semibold">{m.settings_advanced()}</h2>
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="advanced-mode">{m.settings_enable_advanced()}</Label>
			<p class="caption text-sm">{m.settings_enable_advanced_desc()}</p>
		</Stack>
		<Switch id="advanced-mode" bind:checked={advancedMode} />
	</div>

	<div class="flex items-center justify-between">
		<Stack class="gap-1">
			<Label for="hide-side-menu">{m.settings_hide_side_menu()}</Label>
			<p class="caption text-sm">{m.settings_hide_side_menu_desc()}</p>
		</Stack>
		<Switch id="hide-side-menu" bind:checked={hideSideMenu} />
	</div>

	{#if advancedMode}
		<div class="flex items-center justify-between">
			<h2 class="text-muted text-xl font-semibold">{m.settings_developer()}</h2>
		</div>
		<div class="flex items-center justify-between">
			<Stack class="gap-1">
				<Label for="debug-mode">{m.settings_enable_developer()}</Label>
				<p class="caption text-sm">{m.settings_enable_developer_desc()}</p>
			</Stack>
			<Switch id="debug-mode" bind:checked={debugMode} />
		</div>
	{/if}
</div>

{#if debugMode}
	<Code>{JSON.stringify(context.settings.data, null, 2)}</Code>
{/if}
