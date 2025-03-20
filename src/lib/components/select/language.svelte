<script lang="ts">
	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime.js';
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import * as m from '$lib/paraglide/messages';

	let defaultLang = { value: languageTag(), label: m[`common_${languageTag()}`]() };

	const {
		elements: { trigger, menu, option },
		states: { open, selectedLabel }
	} = createSelect<string>({
		defaultSelected: defaultLang,
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
	});
</script>

<button
	class="
	flex
	h-10
	items-center
	justify-between
	gap-2
	rounded-full
	border-2
	border-mine-600
	bg-transparent
	py-2
	pl-4
	pr-3
	font-medium
	transition-opacity
	hover:opacity-90
	focus:outline-2
	focus:outline-solar-500
	focus-visible:border-transparent
	focus-visible:outline
	"
	use:melt={$trigger}
	aria-label="langauge-select-label"
	id="language-select"
>
	{$selectedLabel || 'Select a language'}
	<ChevronDown class="size-5 transition-transform duration-100 {$open ? 'rotate-180' : ''}" />
</button>

{#if $open}
	<div
		class="z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-2xl border-2 border-mine-600 bg-shark-950 px-1 py-1 shadow-sm focus:ring-0!"
		use:melt={$menu}
		in:fade={{ duration: 100 }}
	>
		{#each availableLanguageTags as lang}
			<a
				href={i18n.route($page.url.pathname)}
				hreflang={lang}
				aria-current={lang === languageTag() ? 'page' : undefined}
				class="relative cursor-pointer rounded-xl px-2
				py-1 font-medium
				hover:bg-solar-100 focus:z-10
				focus:text-solar-700 data-highlighted:bg-solar-200
				data-highlighted:text-solar-950
				data-disabled:opacity-50"
				use:melt={$option({ value: lang, label: lang })}
				data-sveltekit-replacestate
			>
				{m[`common_${lang}`]()}
			</a>
		{/each}
	</div>
{/if}
