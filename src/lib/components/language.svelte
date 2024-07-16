<script>
	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages.js';
</script>

<p>Language: {languageTag()}</p>

<p>Test Localization String: {m.test_locale_string()}</p>

<p>
	Change:
	{#each availableLanguageTags as lang}
		<a
			href={i18n.route($page.url.pathname)}
			hreflang={lang}
			style="margin-right: 1em;"
			aria-current={lang === languageTag() ? 'page' : undefined}
		>
			{lang}
		</a>
	{/each}
</p>
