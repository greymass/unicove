<script lang="ts">
	import { Switch } from 'unicove-components';
	import type { CreateSwitchProps } from '@melt-ui/svelte';
	import { browser } from '$app/environment';

	let darkMode = $state(browser && localStorage.getItem('color-scheme') === 'dark');

	const onDarkModeToggle: CreateSwitchProps['onCheckedChange'] = ({ next }) => {
		if (darkMode && localStorage.getItem('color-scheme') == 'light') {
			localStorage.setItem('color-scheme', 'dark');
			document.documentElement.setAttribute('data-scheme', 'dark');
		} else if (!darkMode && localStorage.getItem('color-scheme') === 'dark') {
			localStorage.setItem('color-scheme', 'light');
			document.documentElement.setAttribute('data-scheme', 'light');
		}
		return next;
	};
</script>

<Switch id="color-scheme" onCheckedChange={onDarkModeToggle} bind:checked={darkMode} />
