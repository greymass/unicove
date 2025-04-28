import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	plugins: [
		paraglide({ project: './project.inlang', outdir: './src/lib/paraglide' }),
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
