<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import { type NameType } from '@wharfkit/antelope';
	import {
		Session,
		type LoginOptions,
		type SerializedSession,
		type WalletPlugin
	} from '@wharfkit/session';
	import { chainLogos } from '@wharfkit/common';
	import * as m from '$lib/paraglide/messages';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	import NetworkSwitch from '$lib/components/networkswitch.svelte';

	import X from 'lucide-svelte/icons/x';
	import CircleX from 'lucide-svelte/icons/circle-x';
	import LogOut from 'lucide-svelte/icons/log-out';
	import User from 'lucide-svelte/icons/user';
	import UserCheck from 'lucide-svelte/icons/user-check';
	import UserPlus from 'lucide-svelte/icons/user-plus';
	import Search from 'lucide-svelte/icons/search';
	import { goto } from '$app/navigation';
	import { languageTag } from '$lib/paraglide/runtime';
	import { cn } from '$lib/utils/style';
	import Button from './button/button.svelte';
	import Text from './input/text.svelte';
	import { Wallet } from 'lucide-svelte';

	const context = getContext<UnicoveContext>('state');

	interface PageProps {
		class?: string;
		network: NetworkState;
	}

	let { class: className = '', network }: PageProps = $props();

	let currentSession = $derived(context.wharf.session);

	let filterValue = $state('');
	let addingAccount = $state(false);

	let chainSessions = $derived.by(() => {
		let sessions = context.wharf.sessions.filter((session) =>
			network.chain.id.equals(session.chain)
		);

		if (filterValue) {
			sessions = sessions.filter((session) => session.actor.toString().includes(filterValue));
		}

		return sessions;
	});

	const resetAddingAccount: CreateDialogProps['onOpenChange'] = ({ next }) => {
		addingAccount = false;
		return next;
	};

	const {
		elements: { trigger, overlay, content, close, portalled },
		states: { open }
	} = createDialog({
		// defaultOpen: true, // dev only
		preventScroll: false,
		onOpenChange: resetAddingAccount
	});

	let logo = $derived(chainLogos.get(String(context.wharf.session?.chain.id)) || '');

	function closeDrawer() {
		$open = false;
		addingAccount = false;
	}

	function addAccount() {
		addingAccount = true;
	}

	function redirect(account: NameType) {
		if (!context.settings.data.preventAccountPageSwitching) {
			goto(`/${languageTag()}/${network}/account/${account}`);
		}
	}

	function switchSession(session: SerializedSession) {
		context.wharf.switch(session);
		redirect(session.actor);
		closeDrawer();
	}

	async function removeSession(session?: Session | SerializedSession) {
		if (session) {
			await context.wharf.logout(session);
			if (currentSession) {
				redirect(currentSession.actor);
			}
		}
	}

	async function connectWallet(wallet: WalletPlugin) {
		const options: LoginOptions = {
			walletPlugin: wallet.id
		};
		if (wallet.id !== 'cleos') {
			options.chain = context.network.chain;
		}
		const session = await context.wharf.login(options);
		redirect(session.actor);
		closeDrawer();
	}

	function closeAddingAccount() {
		if (addingAccount) {
			addingAccount = false;
		} else {
			closeDrawer();
		}
	}

	function clearFilter() {
		filterValue = '';
	}

	// function removeAllSessions() {
	// 	context.wharf.logout();
	// 	closeDrawer();
	// }
</script>

<!-- Trigger Button -->
<button
	class={cn(
		'relative z-50 h-10 text-nowrap rounded-lg border border-mineShaft-600 text-base font-medium focus:outline-transparent focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-solar-500',
		className
	)}
	use:melt={$trigger}
	aria-label="account-switcher-label"
	id="account-switcher"
	data-session={!!context.wharf.session}
>
	{#if context.wharf.session}
		<div class="flex items-center gap-2 pl-3.5 pr-4">
			<picture class="size-5">
				<img
					src={String(logo)}
					alt={context.wharf.session.chain.name}
					class="size-full object-contain"
					height="20"
					width="20"
				/>
			</picture>
			<span class="pointer-events-none z-10 text-base text-white/90"
				>{context.wharf.session.actor}</span
			>
		</div>
	{:else}
		<span class="pointer-events-none z-10 px-4 py-2">{m.common_connect_wallet()}</span>
	{/if}
</button>

{#if $open}
	<div class="" use:melt={$portalled}>
		<!-- Scrim -->
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>

		<!-- Content -->
		<div
			use:melt={$content}
			class="fixed right-0 top-0 z-50 flex h-svh min-w-80 max-w-fit flex-col space-y-4 overflow-y-auto overflow-x-hidden bg-shark-950 px-4 py-4 shadow-lg focus:outline-none md:px-6"
			transition:fly={{
				x: 350,
				duration: 300,
				opacity: 1
			}}
		>
			<header
				data-advanced={context.settings.data.advancedMode}
				class="flex flex-row-reverse justify-between gap-2 data-[advanced=false]:items-center md:gap-4"
			>
				<button
					use:melt={$close}
					aria-label="Close"
					data-advanced={context.settings.data.advancedMode}
					class="text-muted grid size-12 appearance-none place-items-center rounded-lg focus:text-white focus:outline-none md:data-[advanced=false]:pt-0 md:data-[advanced=true]:pt-2.5"
				>
					<X class="size-4 " />
				</button>

				<NetworkSwitch currentNetwork={network} class="" />
			</header>

			<section id="content" class="grid">
				{#if chainSessions.length && !addingAccount}
					<div
						id="accounts"
						class="col-start-1 row-start-1 grid content-start gap-4"
						in:fly={{ x: -100, duration: 100 }}
						out:fly={{ x: -100, duration: 100 }}
					>
						<Button onclick={addAccount} variant="secondary" class="grow-0 text-white">
							<div class="flex items-center gap-2">
								<UserPlus class="mb-0.5 size-5" />
								<span>Add Account</span>
							</div>
						</Button>

						<header class="grid gap-3 pt-2 text-xl font-semibold">
							<span>{m.common_my_accounts()}</span>
							{#if chainSessions.length > 4}
								<Text
									class="rounded-full bg-transparent text-sm"
									placeholder="Filter accounts"
									bind:value={filterValue}
								>
									{#if filterValue}
										<button onclick={clearFilter} class="grid place-items-center">
											<CircleX class="size-4" />
										</button>
									{:else}
										<Search class="size-4" />
									{/if}
								</Text>
							{/if}
						</header>

						<ul class="grid gap-2">
							{#each chainSessions as session}
								{@const isCurrent =
									currentSession?.actor.equals(session.actor) &&
									currentSession?.permission.equals(session.permission)}
								<li class="grid grid-cols-[1fr_auto] gap-2">
									<button
										data-current={isCurrent}
										onclick={() => switchSession(session)}
										class="flex h-12 items-center gap-1 rounded-lg px-4
										data-[current=true]:bg-skyBlue-700
										data-[current=true]:text-skyBlue-50
										[@media(any-hover:hover)]:data-[current=false]:hover:bg-mineShaft-950
										[@media(any-hover:hover)]:data-[current=false]:hover:text-mineShaft-50
										"
									>
										<div class="w-6">
											{#if isCurrent}
												<UserCheck class="ml-0.5 size-4 stroke-2" />
											{:else}
												<User class="size-4" />
											{/if}
										</div>

										<div class="text-left font-medium">
											<div>{session.actor}@{session.permission}</div>
											{#if session.walletPlugin.id === 'wallet-plugin-multisig'}
												<div class="text-xs">
													↳ multisig using {session.walletPlugin.data.session.actor}
												</div>
											{/if}
										</div>
									</button>
									<button
										onclick={() => removeSession(session)}
										data-current={isCurrent}
										class="text-muted grid size-12 place-items-center rounded-lg
										[@media(any-hover:hover)]:hover:bg-mineShaft-950
										[@media(any-hover:hover)]:hover:text-mineShaft-50
										"
									>
										<LogOut class="size-4" />
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{:else}
					<div class="col-start-1 row-start-1">
						{@render connectWalletScreen()}
					</div>
				{/if}
			</section>
		</div>
	</div>
{/if}

{#snippet connectWalletScreen()}
	<div class="space-y-4" in:fly={{ x: 100, duration: 150 }} out:fly={{ x: 100, duration: 100 }}>
		<hr class="border-mineShaft-900" />

		<header class="grid justify-center gap-2 py-4 text-center">
			<span class="h4">Login to Unicove</span>
			<span class="text-muted text-sm font-medium">Connect your wallet to login</span>
		</header>

		{#if context.wharf.sessionKit}
			<ul class="grid grid-cols-[auto_1fr_auto]">
				{#each context.wharf.sessionKit?.walletPlugins as wallet}
					<li class="table-row-background table-row-border col-span-full grid grid-cols-subgrid">
						<button
							class="col-span-full grid grid-cols-subgrid gap-4 px-2 py-4 font-semibold text-white"
							onclick={() => connectWallet(wallet)}
						>
							{#if wallet.metadata.logo}
								<img
									class="size-6"
									src={wallet.metadata.logo.toString()}
									alt={wallet.metadata.name}
								/>
							{:else}
								<Wallet class="size-6" />
							{/if}
							<span class="text-left">{wallet.metadata.name}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="grid">
			<!-- <Button  href={`/${network}/signup`} onclick={closeDrawer} variant="primary"> -->
			<!-- 	Create account -->
			<!-- </Button> -->
			<Button class="text-white" onclick={closeAddingAccount} variant="secondary">Cancel</Button>
		</div>
	</div>
{/snippet}
