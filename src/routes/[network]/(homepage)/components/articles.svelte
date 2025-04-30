<script lang="ts">
	import Box from '$lib/components/layout/box/box.svelte';
	import TextBlock from './text-block.svelte';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/button/button.svelte';
	import type { Article } from '$lib/types/content';

	interface Props {
		articles: Article[];
	}

	let { articles }: Props = $props();
</script>

{#each articles as article}
	<section class="@container col-span-full">
		<div class="bg-surface-container grid min-h-72 rounded-2xl px-4 @xl:grid-cols-2 @xl:gap-4">
			<div class="grid place-items-center">
				<img src={article.thumbnail} alt={article.title} class="rounded-2xl" />
			</div>
			<Box class="grid place-items-center py-8">
				<TextBlock title={article.title} text={article.description}>
					<Button variant="primary" href={article.slug}>{m.common_read_more()}</Button>
				</TextBlock>
			</Box>
		</div>
	</section>
{/each}
