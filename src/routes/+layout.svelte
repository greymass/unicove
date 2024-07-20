<script lang="ts">
	import extend from 'just-extend';
	import { onMount } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';

	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import { user } from '$lib/wharf/user.svelte';

	let { children, data } = $props();

	const seo_config: SeoConfig = $derived(extend({}, data.baseMetaTags, $page.data.pageMetaTags));

	onMount(() => {
		user.init();
		user.restore();
	});
</script>

<Head {seo_config} />

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>
