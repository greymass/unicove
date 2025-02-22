<script lang="ts">
	import Metamask from '$lib/assets/metamask.svg';
	import Box from '$lib/components/layout/box/box.svelte';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import TextBlock from './text-block.svelte';
	import HomepageButton from './homepage-button.svelte';
	import * as m from '$lib/paraglide/messages';

	const { network } = getContext<UnicoveContext>('state');

	interface Props {
		networkName: string;
		networkLogo: string;
		productName: string;
	}

	let { networkName, networkLogo, productName }: Props = $props();
</script>

<section class="col-span-full @container">
	<div class="grid min-h-72 rounded-2xl bg-mineShaft-950 px-4 @xl:grid-cols-2 @xl:gap-4">
		<div class="grid place-items-center">
			<svg
				class="col-start-1 row-start-1 h-full w-full object-cover"
				width="635"
				height="296"
				viewBox="0 0 635 296"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M201.577-49.292h231.851l115.925 200.789-115.925 200.788H201.577L85.652 151.497 201.577-49.292Z"
					stroke="#fff"
					stroke-opacity=".1"
				/>
				<path
					d="M179.906 13.903 367.864-36.46l137.594 137.594-50.363 187.957-187.957 50.363L129.543 201.86l50.363-187.957Z"
					stroke="#fff"
					stroke-opacity=".5"
				/>
				<path
					d="M179.009 72.29 317.506-7.424l138.497 79.712v159.422l-138.497 79.712-138.497-79.712V72.289Z"
					stroke="#fff"
				/>
			</svg>
			<div
				class="col-start-1 row-start-1 grid max-w-sm grid-cols-3 items-center justify-items-center"
			>
				<img class="h-40" src={Metamask} alt="metamask" />
				<svg width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M18.008 0v36M36.008 18h-36" stroke="#fff" />
				</svg>
				<img
					class="h-40 rounded-full bg-mineShaft-950 object-contain px-2 py-4"
					src={networkLogo}
					alt={networkName}
					height="160"
					width="160"
				/>
			</div>
		</div>

		<Box class="grid place-items-center py-8">
			<TextBlock
				title={m.homepage_metamask_wallet_title({
					name: productName,
					network: networkName
				})}
				text={m.homepage_metamask_wallet_description({
					name: productName,
					network: networkName
				})}
			>
				<HomepageButton
					class="mt-0.5 bg-solar-500 px-8 text-solar-950
					    hover:active:bg-solar-600 hover:active:text-solar-950 [@media(any-hover:hover)]:hover:bg-solar-400 [@media(any-hover:hover)]:hover:text-solar-950"
					text={m.homepage_metamask_wallet_install({
						name: productName
					})}
					href={`/${network}/metamask`}
				/>
			</TextBlock>
		</Box>
	</div>
</section>
