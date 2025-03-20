<script lang="ts">
	import { onMount } from 'svelte';
	import X from 'lucide-svelte/icons/x';
	import * as m from '$lib/paraglide/messages';
	import dayjs from 'dayjs';

	let props = $props();

	/**
	 * Set the date this banner was updated. At this time, we'll only have one banner.
	 * Note: we can force the banner to be visible on every page load by setting a future date, after which it'll be permanently dismissable.
	 */
	const BANNER_DATE = '2025-03-20';

	function hideBanner() {
		// update the store to immediately hide the banner
		showBanner = false;
		// set the flag to prevent banner showing on next page load
		localStorage.setItem('hide-banner', new Date().toISOString());
	}

	// Default to not show a banner (avoids flash of banner when hidden)
	let showBanner = $state(false);

	onMount(() => {
		// This banner is only for EOS/Vaulta
		if (props.network.shortname !== 'eos') return;

		const prevHidden = localStorage.getItem('hide-banner');
		if (!prevHidden) {
			showBanner = true;
		} else {
			// Show banner if the above date is newer than the date in localstorage
			showBanner = dayjs(prevHidden).isBefore(BANNER_DATE);
		}
	});
</script>

{#if showBanner}
	<aside
		class="grid grid-cols-[auto_1fr_auto] items-center justify-items-center gap-4 bg-gradient-to-r from-[#1C2399] to-[#2E3BFF] text-white shadow-lg *:row-start-1"
	>
		<a
			class="col-start-2 py-4 text-white underline underline-offset-4 md:col-span-3 md:col-start-1 md:text-center"
			href="https://eosnetwork.com/resources/opening-the-gateway-to-web3-banking/"
		>
			<svg
				class="mr-4 inline h-5 w-auto"
				width="357"
				height="151"
				viewBox="0 0 357 151"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M237.164 37.103H188.829C186.932 37.103 185.11 37.861 183.768 39.209L72.461 151.009H0V43.338L43.097 0.0019989V120.027H49.255L161.725 7.058C166.225 2.538 172.326 0 178.688 0H237.164V37.105V37.103ZM356.368 0H283.905L172.6 111.798C171.258 113.146 169.436 113.903 167.539 113.903H119.204V151.007H177.629C184.024 151.007 190.157 148.457 194.677 143.914L307.111 30.984H313.269V132.394H243.83V151.009H313.269L319.666 144.577L325.631 138.579L356.368 107.673V0Z"
					fill="white"
				/>
			</svg><span class="font-semibold">{m.common_breaking_news()}:</span>
			{m.banner_vaulta_rebrand()}
		</a>

		<button
			class="col-start-3 grid size-12 place-items-center justify-self-end text-inherit"
			onclick={hideBanner}
		>
			<X class="size-4 " />
		</button>
	</aside>
{/if}
