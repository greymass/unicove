<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getSnapsProvider, checkIsFlask } from '@wharfkit/wallet-plugin-metamask';

	import Button from '$lib/components/button/button.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import { checkForSnap, requestSnap } from '$lib/metamask-snap';
	import Metamask from '$lib/assets/metamask.svg';
	import { MetaMaskState } from '$lib/state/metamask.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { Cluster, Stack } from '$lib/components/layout/index.js';
	import { chainLogos } from '@wharfkit/common';
	import { DD, DL, DLRow } from '$lib/components/descriptionlist/index.js';
	import TextInput from '$lib/components/input/text.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import * as m from '$lib/paraglide/messages';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	let metaMaskState: MetaMaskState = new MetaMaskState();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let packageInfo: Record<string, any> = $state({});
	let latestVersion: string | undefined = $state();
	let packageName: string | undefined = $state();
	let isMetaMaskSession: boolean = $derived(
		context.wharf.session?.walletPlugin.id === 'wallet-plugin-metamask'
	);

	let currentVersion = $derived(metaMaskState.installedSnap?.version);
	let needsUpdate = $derived(
		latestVersion && metaMaskState.installedSnap?.version !== latestVersion
	);

	$effect(() => {
		if (metaMaskState.isMetaMaskReady) {
			if (metaMaskState.snapProvider !== null) {
				metaMaskState.snapOrigin = data.network.snapOrigin;
				checkIsFlask(metaMaskState.snapProvider).then((isFlask) => {
					metaMaskState.isFlask = isFlask;
					checkForSnap(metaMaskState).then((isInstalled) => {
						metaMaskState.isInstalled = isInstalled;
						if (isInstalled && context.wharf.metamaskPlugin) {
							connect();
							context.wharf.metamaskPlugin
								.retrievePublicKeys(data.network.chain.id)
								.then((publicKey) => {
									metaMaskState.publicKey = publicKey.activePublicKey;
									metaMaskState.ownerKey = publicKey.ownerPublicKey;
								});
						}
					});
				});
			}
		}
	});

	$inspect(packageInfo);

	onMount(async () => {
		if (!data.network.snapOrigin) {
			return goto(`/404`);
		}

		metaMaskState.snapProvider = await getSnapsProvider();
	});

	async function connect() {
		await requestSnap(metaMaskState);
		await getLatestSnapVersion();
	}

	async function getLatestSnapVersion() {
		if (!data.network.snapOrigin?.includes('npm:')) return;

		const npmPackage = data.network.snapOrigin?.split(':')[1];

		const response = await fetch(`https://registry.npmjs.org/${npmPackage}/latest`);
		packageInfo = await response.json();
		packageName = packageInfo.name.slice(1);
		latestVersion = packageInfo.version;
	}

	async function handleUpdateSnap() {
		if (!needsUpdate) return;

		try {
			// Force install latest version by passing it explicitly
			await requestSnap(metaMaskState, latestVersion);
		} catch (error) {
			console.error('Error updating snap:', error);
			alert('Error updating the {network} Wallet snap. Please try again.');
		}
	}

	async function login() {
		context.wharf.login({
			chain: data.network.chain,
			walletPlugin: 'wallet-plugin-metamask'
		});
	}

	async function createAccountAndLogin() {
		try {
			const accountCreationResponse = await context.wharf.createAccount({
				chain: data.network.chain,
				pluginId: 'account-creation-plugin-metamask'
			});
			console.log(`Account created: ${accountCreationResponse.accountName}`);

			await context.wharf.login({
				permissionLevel: `${accountCreationResponse.accountName}@active`,
				walletPlugin: 'wallet-plugin-metamask'
			});
		} catch (error) {
			console.error('Error creating account:', error);
			alert(
				`Error creating account through Metamask. Please make sure that the Antelope snap is enabled.`
			);
		}
	}

	const networkLogo = String(chainLogos.get(String(data.network.chain.id)));
	const networkName = data.network.chain.name;
</script>

<section class="col-span-full @container">
	<div class="grid min-h-72 rounded-2xl bg-mineShaft-950 px-4 @2xl:grid-cols-2 @2xl:gap-4">
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
				<img
					class="h-40 rounded-full bg-mineShaft-950 object-contain"
					src={Metamask}
					alt="metamask"
				/>
				<svg width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M18.008 0v36M36.008 18h-36" stroke="#fff" />
				</svg>
				<img
					class="h-40 rounded-full bg-mineShaft-950 object-contain px-2 py-4"
					src={networkLogo}
					alt={networkName}
				/>
			</div>
		</div>

		<Box class="grid content-start justify-items-start gap-4 text-pretty py-8 *:shrink">
			{#if !metaMaskState.isMetaMaskReady}
				<h2 class="text-xl font-semibold">
					{m.metamask_install_title({
						network: networkName
					})}
				</h2>
				<Stack class="mb-1 gap-2">
					<p class="leading-snug">
						{m.metamask_install_p1({
							network: networkName
						})}
					</p>
					<p class="leading-snug">
						{m.metamask_install_p2({
							network: networkName
						})}
					</p>
				</Stack>
				<Button href={'https://metamask.io/download/'} blank>{m.metamask_install_action()}</Button>
				<p class="text-balance text-xs">
					{m.metamask_install_action_note()}
				</p>
			{:else if currentVersion}
				<h2 class="text-xl font-semibold">
					{m.metamask_install_update({
						network: networkName
					})}
				</h2>
				{#if needsUpdate}
					<p class="mb-1 leading-snug">
						{m.metamask_install_update_description({
							network: networkName,
							latestVersion: String(latestVersion)
						})}
					</p>
					<Button onclick={handleUpdateSnap}
						>{m.metamask_install_update_action({
							network: networkName
						})}</Button
					>
				{:else}
					<Stack class="mb-1 gap-2">
						<p class="leading-snug">
							{m.metamask_install_ready_description({
								network: networkName
							})}
							<a href="https://www.npmjs.com/package/@{packageName}/v/{currentVersion}"
								>{m.common_version()} {currentVersion}</a
							>.
						</p>
						{#if context.wharf.session && isMetaMaskSession}
							<p class="leading-snug">
								{m.metamask_install_logged_in({
									network: networkName,
									account: context.wharf.session.actor
								})}
							</p>
						{:else if context.wharf.session}
							<p class="leading-snug">
								{m.metamask_install_logged_in_alternative({
									account: context.wharf.session.actor
								})}
							</p>
						{:else}
							<p class="leading-snug">
								{m.metamask_install_ready_create_account({
									network: networkName
								})}
							</p>
						{/if}
					</Stack>
					{#if context.wharf.session}
						<Cluster>
							<Button href={`/${data.network}/account/${context.wharf.session.actor}`}
								>{m.common_view_my_account()}</Button
							>
						</Cluster>
					{:else}
						<Cluster>
							<Button onclick={login}>{m.common_login()}</Button>
							<Button onclick={createAccountAndLogin}>{m.common_create_account()}</Button>
						</Cluster>
					{/if}
				{/if}
			{:else}
				<h2 class="text-xl font-semibold">
					{m.metamask_install_add_to_metamask({
						network: networkName
					})}
				</h2>
				<Stack class="mb-1 gap-2">
					<p class="leading-snug">{m.metamask_install_add_p1()}</p>
					<p class="leading-snug">
						{m.metamask_install_add_p2({
							network: networkName
						})}
					</p>
				</Stack>
				<Button onclick={connect}
					>{m.homepage_metamask_wallet_install({
						network: networkName
					})}</Button
				>
			{/if}
		</Box>
	</div>
</section>

{#snippet link(text: string, href: string)}
	<a {href} class="underline hover:text-zinc-300" target="_blank">
		{text}
	</a>
{/snippet}

<div class="mt-8 flex flex-row flex-wrap gap-16">
	<section class="max-w-prose space-y-4">
		<h2 class="text-2xl font-semibold">{m.common_faq()}</h2>
		<h3 class="text-md font-semibold">{m.metamask_install_faq_q1()}</h3>
		<p>
			{@render link('MetaMask Snaps', 'https://metamask.io/snaps/')}
			{m.metamask_install_faq_a1({
				network: networkName
			})}
		</p>

		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q2({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a2_p1({
				network: networkName
			})}
			{@render link(
				m.metamask_snaps_directory(),
				`https://snaps.metamask.io/snap/npm/${packageName}`
			)}.
			{m.metamask_install_faq_a2_p2({
				network: networkName
			})}
		</p>

		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q3({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a3({
				network: networkName
			})}
		</p>

		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q4({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a4({
				network: networkName
			})}
		</p>

		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q5({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a5()}
			{@render link(
				m.metamask_install_faq_a5_link({
					network: networkName
				}),
				'https://support.greymass.com/a/solutions/articles/72000637277'
			)}
		</p>

		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q6({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a6_p1({
				network: networkName
			})}
		</p>
		<p>
			{m.metamask_install_faq_a6_p2({
				network: networkName
			})}
		</p>
		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q7({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a7_p1({
				network: networkName
			})}
		</p>
		<p>
			{m.metamask_install_faq_a7_p2({
				network: networkName
			})}
		</p>

		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q8({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a8({
				network: networkName
			})}
		</p>

		<h3 class="text-md font-semibold">{m.metamask_install_faq_q9()}</h3>
		<p>
			{m.metamask_install_faq_a9_p1({
				network: networkName
			})}
		</p>
		<p>
			{m.metamask_install_faq_a9_p2({
				network: networkName
			})}
		</p>

		<h3 class="text-md font-semibold">{m.metamask_install_faq_q10()}</h3>
		<p>
			{m.metamask_install_faq_a10({
				network: networkName
			})}
		</p>

		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q11({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a11_p1({
				network: networkName
			})}
			{@render link('Wharf', 'https://wharfkit.com/')}
			{m.metamask_install_faq_a11_p2()}
			{@render link(
				'MetaMask Wallet Plugin',
				'https://github.com/wharfkit/wallet-plugin-metamask'
			)}.
		</p>
		<p>
			{m.metamask_install_faq_a11_p3()}
			{@render link(m.common_open_source(), 'https://github.com/greymass/unicove')}
			{m.metamask_install_faq_a11_p4()}
		</p>

		<h3 class="text-md font-semibold">
			{m.metamask_install_faq_q12({
				network: networkName
			})}
		</h3>
		<p>
			{m.metamask_install_faq_a12({
				network: networkName
			})}
		</p>
		<address class="text-muted inline">
			<a href="mailto:support@greymass.com">support@greymass.com</a>
		</address>
		<p class="inline">{m.metamask_install_faq_a12_p2()}</p>
		<p>{@render link('https://support.greymass.com', 'https://support.greymass.com')}</p>
	</section>
	<div class="w-80">
		<Stack class="gap-4">
			{#if context.settings.data.advancedMode}
				<h2 class="text-2xl font-semibold">{m.common_your_public_keys()}</h2>
				{#if metaMaskState.publicKey}
					<p>{m.metamask_public_key_active()}</p>
					<TextInput bind:value={metaMaskState.publicKey} disabled>
						<CopyButton data={String(metaMaskState.publicKey)} />
					</TextInput>
				{/if}
				{#if metaMaskState.ownerKey}
					<p>{m.metamask_public_key_owner()}</p>
					<TextInput bind:value={metaMaskState.ownerKey} disabled>
						<CopyButton data={String(metaMaskState.ownerKey)} />
					</TextInput>
				{/if}
			{/if}
			<h2 class="text-2xl font-semibold">{m.common_details()}</h2>
			<DL>
				<DLRow title={m.metamask_snaps_directory()}>
					<DD>
						<a href="https://snaps.metamask.io/snap/npm/{packageName}">
							{networkName} Wallet
						</a>
					</DD>
				</DLRow>

				<DLRow title={m.common_source_code()}>
					<DD>
						<a href="https://github.com/greymass/antelope-snap/tree/{context.network}"> GitHub </a>
					</DD>
				</DLRow>
				{#if latestVersion}
					<DLRow title="Latest Version">
						<DD>
							<a href="https://www.npmjs.com/package/@{packageName}?activeTab=versions">
								{latestVersion}
							</a>
						</DD>
					</DLRow>
				{/if}
			</DL>
		</Stack>
	</div>
</div>
