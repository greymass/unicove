<script lang="ts">
	import { BlockTimestamp } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';

	import Switch from '$lib/components/input/switch.svelte';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { Card, Stack } from '$lib/components/layout';
	import { type UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import * as m from '$lib/paraglide/messages';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Select from '$lib/components/select/select.svelte';
	import type { ExtendedSelectOption } from '$lib/components/select/types.js';
	import { TimeSeconds } from '$lib/state/settings.svelte.js';
	import DatetimeInput from '$lib/components/input/datetime.svelte';
	import type { FormEventHandler } from 'svelte/elements';
	import Button from '$lib/components/button/button.svelte';
	import { availableLanguageTags } from '$lib/paraglide/runtime';
	import CurrencySelect from '$lib/components/select/currency.svelte';
	import DebugToggle from '$lib/components/select/debug.svelte';
	import type { CreateSwitchProps } from '@melt-ui/svelte';

	const context = getContext<UnicoveContext>('state');

	let preventAccountPageSwitching = $state(!!context.settings.data.preventAccountPageSwitching);
	let searchAccountSwitch = $state(!!context.settings.data.searchAccountSwitch);
	let searchShowPages = $state(!!context.settings.data.searchShowPages);
	let advancedMode = $state(!!context.settings.data.advancedMode);
	let developerMode = $state(!!context.settings.data.developerMode);
	let mockPrice = $state(!!context.settings.data.mockPrice);
	let increasedPrecision = $state(!!context.settings.data.increasedPrecision);
	let darkMode = $state(localStorage.getItem('color-scheme') === 'dark');

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
		context.settings.data.developerMode = advancedMode ? developerMode : false;
	});

	$effect(() => {
		context.settings.data.increasedPrecision = advancedMode ? increasedPrecision : false;
	});

	$effect(() => {
		context.settings.data.mockPrice = advancedMode ? mockPrice : false;
	});

	const range: ExtendedSelectOption[] = [
		{ label: '15 minutes', value: TimeSeconds['15m'] },
		{ label: '1 day', value: TimeSeconds['1d'] },
		{ label: '1 week', value: TimeSeconds['1w'] },
		{ label: '1 month', value: TimeSeconds['1mo'] },
		{ label: '1 year', value: TimeSeconds['1y'] }
	];
	const defaultRangeIndex = 3;

	let expireSeconds = $derived(context.wharf.session?.walletPlugin.data.expireSeconds);

	let selectedRange: ExtendedSelectOption = $derived(
		range.find((r) => r.value === expireSeconds) || range[defaultRangeIndex]
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

	const onDarkModeToggle: CreateSwitchProps['onCheckedChange'] = ({ next }) => {
		if (darkMode && localStorage.getItem('color-scheme') == 'light') {
			localStorage.setItem('color-scheme', 'dark');
			document.documentElement.setAttribute('data-scheme', 'dark');
		} else if (!darkMode && localStorage.getItem('color-scheme') === 'dark') {
			localStorage.setItem('color-scheme', 'light');
			document.documentElement.setAttribute('data-scheme', 'light');
		}
		return next;
	};
</script>

<Stack tag="article" class="gap-6">
	<Pageheader
		network={data.network}
		title={m.common_settings()}
		subtitle={m.settings_page_subtitle()}
	/>
	<div class="grid max-w-2xl gap-8">
		{#if context.wharf.session?.walletPlugin.id === 'wallet-plugin-multisig'}
			<Card class=" grid gap-8 ">
				<div class="flex items-center justify-between">
					<h2 class="text-muted text-2xl font-semibold">MSIG Configuration</h2>
				</div>
				<div class="flex items-center justify-between">
					<Stack class="gap-2">
						<Label for="proposal-expiration">Proposal Expiration</Label>
						<p class="caption text-sm">The expiration date set on multisig proposals.</p>
					</Stack>
					<Select
						id="proposal-expiration"
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
			</Card>
		{/if}

		<Card class=" grid gap-8 ">
			<div class="flex items-center justify-between">
				<h2 class="text-muted text-2xl font-semibold">Preferences</h2>
			</div>
			<div class="flex items-center justify-between gap-2">
				<Stack class="gap-2">
					<Label for="language-select">
						<div class="flex justify-between gap-2">
							{#each availableLanguageTags as lang}
								<span>{m.settings_language_selector({}, { languageTag: lang })}</span>
							{/each}
						</div>
					</Label>
					<p class="caption text-sm">The language used throughout Unicove.</p>
				</Stack>
				<LanguageSelect />
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="proposal-expiration">Prefered Currency</Label>
					<p class="caption text-sm">The currency used to display the value of tokens.</p>
				</Stack>
				<CurrencySelect />
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="increased-precision">Increased Precision</Label>
					<p class="caption text-sm">Use more decimals to increase currency precision.</p>
				</Stack>
				<Switch id="increased-precision" bind:checked={increasedPrecision} />
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="color-scheme">Dark Mode</Label>
					<p class="caption text-sm text-balance">
						Toggle site wide dark mode independent from operating system preferences.
					</p>
				</Stack>
				<Switch id="color-scheme" onCheckedChange={onDarkModeToggle} bind:checked={darkMode} />
			</div>
		</Card>

		<Card class=" grid gap-8 ">
			<div class="flex items-center justify-between">
				<h2 class="text-muted text-2xl font-semibold">Navigation</h2>
			</div>
			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="search-show-pages">{m.settings_search_show_pages()}</Label>
					<p class="caption text-sm">{m.settings_search_show_pages_desc()}</p>
				</Stack>
				<Switch id="search-show-pages" bind:checked={searchShowPages} />
			</div>
			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="search-account-switch">{m.settings_search_account_switch()}</Label>
					<p class="caption text-sm">{m.settings_search_account_switch_desc()}</p>
				</Stack>
				<Switch id="search-account-switch" bind:checked={searchAccountSwitch} />
			</div>
			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="prevent-account-page-switching"
						>{m.settings_prevent_account_page_switching()}</Label
					>
					<p class="caption text-sm">{m.settings_prevent_account_page_switching_desc()}</p>
				</Stack>
				<Switch id="prevent-account-page-switching" bind:checked={preventAccountPageSwitching} />
			</div>
		</Card>

		<Card class=" grid gap-8 ">
			<div class="flex items-center justify-between">
				<h2 class="text-muted text-2xl font-semibold">{m.settings_advanced()}</h2>
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="advanced-mode">{m.settings_enable_advanced()}</Label>
					<p class="caption text-sm">{m.settings_enable_advanced_desc()}</p>
				</Stack>
				<Switch id="advanced-mode" bind:checked={advancedMode} />
			</div>
		</Card>

		{#if advancedMode}
			<Card class=" grid gap-8 ">
				<div class="flex items-center justify-between">
					<h2 class="text-muted text-2xl font-semibold">{m.settings_developer()}</h2>
				</div>
				<div class="flex items-center justify-between">
					<Stack class="gap-2">
						<Label for="debug-mode">{m.settings_enable_developer()}</Label>
						<p class="caption text-sm">{m.settings_enable_developer_desc()}</p>
					</Stack>
					<Switch id="debug-mode" bind:checked={developerMode} />
				</div>
				{#if developerMode}
					<div class="flex items-center justify-between">
						<Stack class="gap-2">
							<Label for="debug-mode">{m.settings_enable_mockprice()}</Label>
							<p class="caption text-sm text-balance">
								{m.settings_enable_mockprice_desc({
									mockValue: '$1.2345 USD'
								})}
							</p>
						</Stack>
						<Switch id="mock-price" bind:checked={mockPrice} />
					</div>
					<div class="flex items-center justify-between">
						<Stack class="gap-2">
							<Label for="debug-mode">{m.settings_enable_debug()}</Label>
							<p class="caption text-sm"></p>
						</Stack>
						<DebugToggle />
					</div>
				{/if}
			</Card>
		{/if}
	</div>
	{#if context.settings.data.debugMode}
		<Code>{JSON.stringify(context.settings.data, null, 2)}</Code>
	{/if}
</Stack>
