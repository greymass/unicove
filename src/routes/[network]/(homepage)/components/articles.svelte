<script lang="ts">
	import TextBlock from './text-block.svelte';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/button/button.svelte';
	import IconButton from '$lib/components/button/icon.svelte';
	import type { Article } from '$lib/types/content';
	import { ChevronLeft, ChevronRight, Circle } from 'lucide-svelte';

	interface Props {
		articles: Article[];
	}

	let { articles }: Props = $props();

	let index = $state(0);
	const onNext = () => (index = (index + 1) % articles.length);
	const onPrevious = () => (index = (index - 1 + articles.length) % articles.length);
</script>

<section class="@container col-span-full grid *:col-span-full *:col-start-1 *:row-start-1">
	{#each articles as article, i}
		<div
			class:sr-only={i !== index}
			class="grid min-h-72 grid-cols-2 items-center gap-8 rounded-2xl @3xl:grid-cols-[auto_1fr_1fr_auto] @3xl:gap-y-10"
		>
			<IconButton
				icon={ChevronLeft}
				size="large"
				class="text-muted col-start-1  row-start-3 @3xl:row-start-1"
				onclick={onPrevious}
			/>
			<div class="col-span-full grid place-items-center @3xl:col-span-1">
				<img
					src={article.thumbnail}
					alt={article.title}
					class="rounded-2xl"
					width="512"
					height="288"
				/>
			</div>
			<div class="col-span-full grid place-items-center @3xl:col-span-1">
				<TextBlock title={article.title} text={article.description}>
					<Button variant="primary" href={article.slug}>
						{m.common_read_more()}
					</Button>
				</TextBlock>
			</div>
			<IconButton
				icon={ChevronRight}
				size="large"
				class="text-muted col-start-2 row-start-3 justify-self-end @3xl:col-start-4 @3xl:row-start-1"
				onclick={onNext}
			/>

			<div
				class="col-span-full col-start-1 row-start-3 flex items-center justify-center gap-2 @3xl:row-start-2"
			>
				{#each articles as article, i}
					<button onclick={() => (index = i)}>
						<Circle
							id={article.slug}
							aria-selected={i === index}
							class="stroke-on-background aria-selected:fill-on-background size-2"
						/>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</section>
