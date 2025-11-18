import { adapter as svelte } from '@wuchale/svelte';
import { adapter as js } from 'wuchale/adapter-vanilla';
import { defineConfig, gemini } from 'wuchale';

import { ADDITIONAL_LOCALES, DEFAULT_LOCALE } from './src/lib/constants/locales.js';

let ai;
// if (process.env.WUCHALE_GEMINI === 'true') {
ai = gemini({
	batchSize: 40,
	parallel: 5,
	think: true, // default: false
	apiKey: process.env.GEMINI_API_KEY
});
// }

export default defineConfig({
	sourceLocale: DEFAULT_LOCALE,
	otherLocales: ADDITIONAL_LOCALES,
	adapters: {
		main: svelte(),
		js: js({
			files: ['src/**/+{page,layout}.{js,ts}', 'src/**/+{page,layout}.server.{js,ts}']
		})
	},
	ai
});
