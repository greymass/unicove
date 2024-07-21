<script lang="ts">
	import extend from 'just-extend';
	import { onMount } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';

	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import { user } from '$lib/wharf/user.svelte';
	import Navigation from '$lib/components/navigation.svelte';

	let { children, data } = $props();

	const seo_config: SeoConfig = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, $page.data.pageMetaTags)
	);

	onMount(() => {
		user.init();
		user.restore();
	});
</script>

<Head {seo_config} />

<ParaglideJS {i18n}>
	<Navigation />
	{@render children()}
</ParaglideJS>
