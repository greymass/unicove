import { sequence } from '@sveltejs/kit/hooks';
import { sourceLanguageTag, availableLanguageTags } from '$lib/paraglide/runtime';
import { i18n } from '$lib/i18n';

export const i18nHandle = i18n.handle();

export function getHeaderLang(event) {
	const acceptLanguage = event.request.headers.get('accept-language');
	const locales =
		acceptLanguage?.split(',')?.map((lang) => {
			console.log('parse', lang);
			return lang.split(';')[0].split('-')[0].trim();
		}) ?? [];
	for (const locale of locales) {
		if (availableLanguageTags.includes(locale)) {
			return locale;
		}
	}
	return null;
}

export async function redirectHandle({ event, resolve }) {
	const { pathname, search } = new URL(event.request.url);
	const pathLang = pathname.match(/[^/]+?(?=\/|$)/);
	const matchedLang = pathLang ? pathLang[0].toLowerCase() : null;
	let lang = availableLanguageTags.find((l) => l.toLowerCase() === matchedLang);
	if (!lang) {
		lang = getHeaderLang(event) || sourceLanguageTag;
		const pathnameWithoutLang = pathLang ? pathname.replace(`/${pathLang}`, '') : pathname;
		return new Response(undefined, {
			headers: { Location: `/${lang}${pathnameWithoutLang}${search}` },
			status: 301
		});
	}
	event.locals.lang = lang;
	const response = await resolve(event);
	return response;
}

export const handle = sequence(i18nHandle, redirectHandle);
