<script lang="ts">
	import { onMount } from 'svelte';
	import { History, Languages, SearchX } from '@lucide/svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { localizePath } from '$lib/utils/url';
	import { parseVpAnchor } from '$lib/vp/anchors';

	interface Props {
		container: HTMLElement | undefined;
		mode: 'exact' | 'section';
	}

	const { container, mode }: Props = $props();

	let notice: 'edited' | 'removed' | 'translation' | null = $state(null);
	let englishHref = $state('');

	const CITED = 'vp-cited';
	const FIRST = 'vp-cited-first';
	const LAST = 'vp-cited-last';

	function holds(el: Element, token: string): boolean {
		return (el.getAttribute('data-vp-anchors') ?? '').split(' ').includes(token);
	}

	function focus() {
		if (!container) return;
		container
			.querySelectorAll(`.${CITED}`)
			.forEach((el) => el.classList.remove(CITED, FIRST, LAST));
		notice = null;
		const target = parseVpAnchor(window.location.hash);
		if (!target) return;

		const blocks = Array.from(container.querySelectorAll('[data-vp-anchors]'));
		const first = blocks.findIndex((el) => holds(el, target.first));
		const last = blocks.findIndex((el) => holds(el, target.last));
		let hits: Element[] = [];
		if (first !== -1 && last >= first) {
			hits = blocks.slice(first, last + 1);
			if (mode === 'section') notice = 'translation';
		} else {
			const section = target.section
				? blocks.find((el) => holds(el, target.section as string))
				: undefined;
			hits = section ? [section] : [];
			notice = section ? 'edited' : 'removed';
		}

		englishHref = `${localizePath(page.url.pathname, { forceLocale: 'en' })}${window.location.hash}`;
		// Forces a reflow so a repeat citation replays its arrival animation.
		void container.offsetWidth;
		hits.forEach((el) => el.classList.add(CITED));
		hits[0]?.classList.add(FIRST);
		hits.at(-1)?.classList.add(LAST);
		if (hits.length) hits[0].scrollIntoView({ block: 'center' });
		else window.scrollTo({ top: 0 });
	}

	afterNavigate(() => focus());
	onMount(() => {
		window.addEventListener('hashchange', focus);
		return () => window.removeEventListener('hashchange', focus);
	});
</script>

{#if notice}
	{@const Icon = notice === 'edited' ? History : notice === 'removed' ? SearchX : Languages}
	<div class="vp-notice bg-on-surface text-surface" role="status">
		<Icon
			class="mt-0.5 size-5 shrink-0 text-(--color-solar-300) dark:text-(--color-solar-700)"
			aria-hidden="true"
		/>
		<p class="flex-1 leading-relaxed text-inherit">
			{#if notice === 'edited'}
				The linked passage was edited after this link was shared, so the section that held it is
				highlighted.
			{:else if notice === 'removed'}
				The linked passage was edited after this link was shared and is no longer in this document.
			{:else}
				The lines of this translation do not match the English text here, so the whole section is
				highlighted. <a class="font-medium underline underline-offset-2" href={englishHref}
					>Read the exact passage in English</a
				>.
			{/if}
		</p>
		<button
			class="-my-1 shrink-0 rounded-md px-2 py-1 font-medium opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
			onclick={() => (notice = null)}>Dismiss</button
		>
	</div>
{/if}

<style>
	.vp-notice {
		position: fixed;
		inset-inline: 1rem;
		bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
		z-index: 50;
		margin-inline: auto;
		display: flex;
		max-width: 36rem;
		align-items: flex-start;
		gap: 0.75rem;
		border-radius: 0.75rem;
		padding: 0.875rem 1rem;
		font-size: 0.875rem;
		box-shadow:
			0 12px 32px -8px rgb(0 0 0 / 0.45),
			0 4px 8px -4px rgb(0 0 0 / 0.3);
		animation: vp-notice-in 320ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes vp-notice-in {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.vp-notice {
			animation: none;
		}
	}
</style>
