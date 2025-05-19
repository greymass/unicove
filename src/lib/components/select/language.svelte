<script lang="ts">
	import { page } from '$app/stores';
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { m } from '$lib/paraglide/messages';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getLocale, locales, localizeHref } from '$lib/paraglide/runtime';

	let defaultLang = { value: getLocale(), label: m[`common_${getLocale()}`]() };
	const context = getContext<UnicoveContext>('state');

	const {
		elements: { trigger, menu, option },
		states: { open, selectedLabel }
	} = createSelect<string>({
		defaultSelected: defaultLang,
		forceVisible: true,
		preventScroll: false,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
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
	<div
		data-theme={context.network}
		class="border-outline bg-surface-container z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-2xl border-2 px-1 py-1 shadow-sm focus:ring-0!"
		use:melt={$menu}
		in:fade={{ duration: 100 }}
	>
		{#each locales as lang}
			<a
				href={localizeHref($page.url.pathname, { locale: lang })}
				hreflang={lang}
				aria-current={lang === getLocale() ? 'page' : undefined}
				class=" hover:bg-primary hover:text-on-primary focus:text-on-primary data-highlighted:bg-primary data-highlighted:text-on-primary relative cursor-pointer rounded-xl px-2 py-1 font-medium focus:z-10 data-disabled:opacity-50"
				use:melt={$option({ value: lang, label: lang })}
				data-sveltekit-replacestate
			>
				{m[`common_${lang}`]()}
			</a>
		{/each}
	</div>
{/if}
