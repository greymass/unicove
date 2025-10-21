<script lang="ts">
	import { page } from '$app/state';
	import { languageNames } from '$lib/i18n';
	import {
		availableLanguageTags,
		languageTag,
		type AvailableLanguageTag
	} from '$lib/paraglide/runtime.js';
	import { createSelect, melt, type CreateSelectProps } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { goto } from '$app/navigation';
	import { setLocale } from '$lib/remote/locale.remote';
	import { locales } from 'virtual:wuchale/locales';

	const displayName = (loc: string) =>
		new Intl.DisplayNames([loc], { type: 'language' }).of(loc) || 'Unknown';

	const context = getContext<UnicoveContext>('state');
	let defaultLang = {
		value: context.settings.data.locale as AvailableLanguageTag,
		label: displayName(context.settings.data.locale)
	};


	const handleSelect: CreateSelectProps<AvailableLanguageTag>['onSelectedChange'] = ({ next }) => {
		if (next?.value) {
			setLocale(next.value).then(() => {
				context.settings.data.locale = next.value;
				goto(`/${next.value}/${context.network}/settings`);
			});
		}
		return next;
	};

	const {
		elements: { trigger, menu, option },
		states: { open, selectedLabel }
	} = createSelect<AvailableLanguageTag>({
		defaultSelected: defaultLang,
		preventScroll: false,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		},
		onSelectedChange: handleSelect
	});
</script>

<button
	class="border-outline focus:border-primary flex h-10 items-center justify-between gap-2 rounded-full border-2 bg-transparent py-2 pr-3 pl-4 font-medium transition-opacity hover:opacity-90 focus:outline-none"
	use:melt={$trigger}
	aria-label="langauge-select-label"
	id="language-select"
>
	{$selectedLabel || 'Select a language'}
	<ChevronDown class="size-5 transition-transform duration-100 {$open ? 'rotate-180' : ''}" />
</button>

{#if $open}
	<ul
		data-theme={context.network}
		class="border-outline bg-surface-container z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-2xl border-2 px-1 py-1 shadow-sm focus:ring-0!"
		use:melt={$menu}
		in:fade={{ duration: 100 }}
	>
		{#each availableLanguageTags as lang}
			<li
				aria-current={lang === languageTag() ? 'page' : undefined}
				class=" hover:bg-primary hover:text-on-primary focus:text-on-primary data-highlighted:bg-primary data-highlighted:text-on-primary relative cursor-pointer rounded-xl px-2 py-1 font-medium focus:z-10 data-disabled:opacity-50"
				use:melt={$option({ value: lang, label: displayName(lang) })}
			>
				{displayName(lang)}
			</li>
		{/each}
	</ul>
{/if}
