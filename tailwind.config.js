import defaultTheme from 'tailwindcss/defaultTheme';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{svelte,html,js,ts}'],
	theme: {
		// fontSize: {
		// 	xs: ['8px', '0.75rem'], // 8px
		// 	sm: ['0.625rem', '1rem'], // 10px
		// 	base: ['0.75rem', '1rem'], // 12px
		// 	lg: ['0.875rem', '1.25rem'], // 14px
		// 	xl: ['1rem', '1.5rem'], // 16px
		// 	'2xl': ['1.125rem', '1.75rem'], // 18px
		// 	'3xl': ['1.25rem', '1.75rem'], // 20px
		// 	'4xl': ['1.5rem', '2rem'], // 24px
		// 	'5xl': ['1.875rem', '2.25rem'], // 30px
		// 	'6xl': ['2.25rem', '2.5rem'], // 36px
		// 	'7xl': ['3rem', '1'] // 48px
		// },
		extend: {
			fontFamily: {
				sans: ['Inter', ...defaultTheme.fontFamily.sans]
			},
			colors: {
				shark: {
					50: '#f4f6f7',
					100: '#e2e8eb',
					200: '#c9d3d8',
					300: '#a3b3bd',
					400: '#768c9a',
					500: '#5a7080',
					600: '#4e5e6c',
					700: '#434f5b',
					800: '#3c454e',
					900: '#363c43',
					950: '#1b1f24'
				},
				mineShaft: {
					50: '#f4f5f7',
					100: '#e4e7e9',
					200: '#cbd1d6',
					300: '#a7b1b9',
					400: '#7c8894',
					500: '#616d79',
					600: '#535c67',
					700: '#474d57',
					800: '#3f444b',
					900: '#383c41',
					950: '#22252a'
				},
				skyBlue: {
					50: '#eff9ff',
					100: '#def3ff',
					200: '#b6e8ff',
					300: '#75d9ff',
					400: '#2cc6ff',
					500: '#00b5ff',
					600: '#008cd4',
					700: '#006fab',
					800: '#005e8d',
					900: '#064e74',
					950: '#04314d'
				},
				springGreen: {
					50: '#edfff8',
					100: '#d5fff0',
					200: '#aeffe2',
					300: '#70ffcc',
					400: '#2bfdb0',
					500: '#00ed97',
					600: '#00c076',
					700: '#00965f',
					800: '#06754e',
					900: '#076042',
					950: '#003724'
				},
				solar: {
					50: '#fffdea',
					100: '#fff8c5',
					200: '#fff185',
					300: '#ffe246',
					400: '#ffd11b',
					500: '#ffb000',
					600: '#e28600',
					700: '#bb5d02',
					800: '#984808',
					900: '#7c3b0b',
					950: '#481d00'
				}
			}
		}
	},
	plugins: [containerQueries]
};
