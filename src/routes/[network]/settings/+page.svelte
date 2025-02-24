<script lang="ts">
	import { BlockTimestamp } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';

	import Switch from '$lib/components/input/switch.svelte';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { Stack } from '$lib/components/layout';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import * as m from '$lib/paraglide/messages';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Select from '$lib/components/select/select.svelte';
	import type { ExtendedSelectOption } from '$lib/components/select/types.js';
	import { TimeSeconds } from '$lib/state/settings.svelte.js';
	import DatetimeInput from '$lib/components/input/datetime.svelte';
	import type { FormEventHandler } from 'svelte/elements';
	import Button from '$lib/components/button/button.svelte';

	const context = getContext<UnicoveContext>('state');

	let preventAccountPageSwitching = $state(!!context.settings.data.preventAccountPageSwitching);
	let searchAccountSwitch = $state(!!context.settings.data.searchAccountSwitch);
	let searchShowPages = $state(!!context.settings.data.searchShowPages);
	let advancedMode = $state(!!context.settings.data.advancedMode);
	let debugMode = $state(!!context.settings.data.debugMode);

	let refEarliestExecution: DatetimeInput | undefined = $state();

	let { data } = $props();

	$effect(() => {
		context.settings.data.advancedMode = advancedMode;
	});

	$effect(() => {
		context.settings.data.preventAccountPageSwitching = preventAccountPageSwitching;
	});

	$effect(() => {
		context.settings.data.searchAccountSwitch = searchAccountSwitch;
	});

	$effect(() => {
		context.settings.data.searchShowPages = searchShowPages;
	});

	$effect(() => {
		context.settings.data.debugMode = advancedMode ? debugMode : false;
	});

	const range: ExtendedSelectOption[] = [
		{ label: '15 minutes', value: TimeSeconds['15m'] },
		{ label: '1 day', value: TimeSeconds['1d'] },
		{ label: '1 week', value: TimeSeconds['1w'] },
		{ label: '1 month', value: TimeSeconds['1mo'] },
		{ label: '1 year', value: TimeSeconds['1y'] }
	];

	let expireSeconds = $derived(context.wharf.session?.walletPlugin.data.expireSeconds);

	let selectedRange: ExtendedSelectOption | undefined = $derived(
		range.find((r) => {
			return r.value === expireSeconds;
		}) || undefined
	);

	const onExpireSelectedChange: ChangeFn<ExtendedSelectOption | undefined> = ({ next }) => {
		if (context.wharf.session) {
			context.wharf.setWalletSetting('expireSeconds', next?.value || TimeSeconds['1mo']);
		}
		return next;
	};

	let earliestExecution: Date | undefined = $derived(
		context.wharf.session?.walletPlugin.data.earliestExecution
	);

	let timestamp = $derived(
		earliestExecution ? BlockTimestamp.fromDate(new Date(earliestExecution)) : undefined
	);

	const onEarliestExecutionChange: FormEventHandler<HTMLInputElement> = (event) => {
		context.wharf.setWalletSetting(
			'earliestExecution',
			event.currentTarget.value ? new Date(`${event.currentTarget.value}:00.000`) : undefined
		);
	};

	function clearEarliestExecution() {
		refEarliestExecution?.set(undefined);
		context.wharf.setWalletSetting('earliestExecution', undefined);
	}
</script>

<Stack tag="article" class="gap-6">
	<Pageheader
		network={data.network}
		title={m.common_settings()}
		subtitle={m.settings_page_subtitle()}
	/>
	<div class="grid max-w-screen-sm gap-8">
		{#if context.wharf.session?.walletPlugin.id === 'wallet-plugin-multisig'}
			<div class="flex items-center justify-between">
				<h2 class="text-muted text-xl font-semibold">Multisig Configuration</h2>
			</div>
			<div class="flex items-center justify-between">
				<Stack class="gap-1">
					<Label for="search-show-pages">Proposal Expiration</Label>
					<p class="caption text-sm">The expiration date set on multisig proposals.</p>
				</Stack>
				<Select
					id="range-select"
					options={range}
					onSelectedChange={onExpireSelectedChange}
					selected={selectedRange}
				/>
			</div>
			{#if advancedMode}
				<fieldset class="grid gap-4">
					<Label for="search-show-pages">Proposal Earliest Execution</Label>
					<p class="caption text-sm">
						Set a datetime to specify the earliest a proposal can be executed. This value will be
						reset after each proposal is created.
					</p>
					<DatetimeInput
						bind:this={refEarliestExecution}
						oninput={onEarliestExecutionChange}
						date={earliestExecution}
					>
						Local&nbsp;Time
					</DatetimeInput>
					{#if timestamp}
						<p class="text-sm">
							Set for UTC: {timestamp}
							<Button variant="pill" onclick={clearEarliestExecution}>Clear</Button>
						</p>
					{/if}
				</fieldset>
			{/if}
		{/if}

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
</Stack>
