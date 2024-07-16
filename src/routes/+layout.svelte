<script>
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';

	import { onMount } from 'svelte';
	import { user } from '$lib/wharf';

	let { children } = $props();

	onMount(() => {
		if (user) {
			user.restore();
		}
	});
</script>

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>
