import { adapter as svelte } from '@wuchale/svelte';
import { adapter as js } from 'wuchale/adapter-vanilla';
import { defineConfig, gemini } from 'wuchale';

let ai;
if (process.env.WUCHALE_GEMINI === 'true') {
	ai = gemini({
		batchSize: 40,
		parallel: 5,
		think: true // default: false
	});
}

export default defineConfig({
	otherLocales: ['ko', 'zh'],
	adapters: {
		main: svelte({
			files: ['src/**/*.svelte', 'src/**/*.svelte.{js,ts}']
		}),
		js: js({
			files: ['src/**/*.server.{js,ts}', 'src/**/+{page,layout}.{js,ts}']
			// writeFiles: {
			// 	compiled: true,
			// 	proxy: true
			// }
		})
	},
	ai
});
