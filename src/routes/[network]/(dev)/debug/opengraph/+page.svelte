<script lang="ts">
	import { ogImage } from '$lib/utils/opengraph';

	let { data } = $props();
	const { url, baseMetaTags } = data;

	const og_default = baseMetaTags.open_graph_image;
	const test1 = new URL(url.origin + '/en/eos/send');
	const test2 = new URL(url.origin + '/zh/eos/send');
	const test3 = new URL(url.origin + '/ko/eos/send');
</script>

<section class="space-y-6">
	<h1 class="h2">Opengraph Images</h1>
	<img src={og_default} alt="" />
	<img src={ogImage(test1)} alt="" />
	<img src={ogImage(test2)} alt="" />
	<img src={ogImage(test3)} alt="" />
</section>
