import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	plugins: [
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'preferredLanguage'],
			urlPatterns: [
				{
					pattern: '/:path(.*)?',
					localized: [
						['ko', '/ko/:path(.*)?'],
						['zh', '/zh/:path(.*)?'],
						['en', '/en/:path(.*)?']
					]
				}
			],
			disableAsyncLocalStorage: true
		}),
		enhancedImages(),
		sveltekit(),
		tailwindcss()
	],
	resolve: {
		alias: {
			$paraglide: path.resolve(__dirname, './src/paraglide')
		}
	}
});
