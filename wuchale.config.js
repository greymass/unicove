import { adapter as svelte } from '@wuchale/svelte';
import { defineConfig, gemini } from 'wuchale';

const ignore = ['src/routes/[network]/(dev)/**', 'src/**/+*.server.{js,ts}'];

export default defineConfig({
	otherLocales: ['ko', 'zh'],
	adapters: {
		main: svelte({
			files: {
				include: [
					'src/**/*.svelte',
					'src/**/+{page,layout}.{js,ts}',
					'src/**/*.svelte.{js,ts}',
					'src/**/*.server.svelte.{js,ts}'
				],
				ignore
			}
		})
	}
	// ai: gemini({
	// 	batchSize: 40,
	// 	parallel: 5,
	// 	think: true // default: false
	// })
});
