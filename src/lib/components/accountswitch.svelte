<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { Session, type SerializedSession } from '@wharfkit/session';
	import { chainLogos } from '@wharfkit/common';

	import { chainMap } from '$lib/wharf/chains';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	import NetworkSwitch from '$lib/components/networkswitch.svelte';

	import CircleX from 'lucide-svelte/icons/circle-x';
	import UserPlus from 'lucide-svelte/icons/user-plus';
	import LogOut from 'lucide-svelte/icons/log-out';
	import User from 'lucide-svelte/icons/user';
	import UserCheck from 'lucide-svelte/icons/user-check';
	import { goto } from '$app/navigation';
	import { languageTag } from '$lib/paraglide/runtime';

	const context = getContext<UnicoveContext>('state');

	interface PageProps {
		class?: string;
		network: NetworkState;
	}

	let { class: className = '', network }: PageProps = $props();

	let currentSession = $derived(context.wharf.session);

	function closeDrawer() {
		$open = false;
	}

	function addSession() {
		context.wharf.login({
			chain: network.chain.id
		});
	}

	function switchSession(session: SerializedSession) {
		context.wharf.switch(session);
		closeDrawer();
	}

	function removeSession(session?: Session | SerializedSession) {
		if (session) {
			context.wharf.logout(session);
		}
		closeDrawer();
	}

	// function removeAllSessions() {
	// 	context.wharf.logout();
	// 	closeDrawer();
	// }

	const {
		elements: { trigger, overlay, content, close, portalled },
		states: { open }
	} = createDialog({
		// defaultOpen: true,
		forceVisible: true
	});

	let logo = $derived(chainLogos.get(String(context.wharf.session?.chain.id)) || '');
</script>

<!-- [@media(any-hover:hover)]:hover:opacity-80 -->

<!-- Trigger Button -->
<button
	class="
	relative
	z-50
	h-10
	text-nowrap
	rounded-lg
	border
	border-mineShaft-600
	text-base
	font-medium
	focus:outline-transparent
	focus-visible:outline
	focus-visible:ring-2
	focus-visible:ring-inset
	focus-visible:ring-solar-500
	{className}
	"
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
				/>
			</picture>
			<span class="pointer-events-none z-10 text-base text-white/90"
				>{context.wharf.session.actor}</span
			>
		</div>
	{:else}
		<span class="pointer-events-none z-10 px-4 py-2">Connect Wallet</span>
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
			class="fixed right-0 top-0 z-50 h-svh max-w-fit space-y-4 overflow-y-auto overflow-x-hidden bg-shark-950 px-6 py-4 shadow-lg focus:outline-none"
			transition:fly={{
				x: 350,
				duration: 300,
				opacity: 1
			}}
		>
			<section class="flex flex-row-reverse justify-between gap-4">
				<button
					use:melt={$close}
					aria-label="Close"
					class="
					grid size-12 appearance-none
					place-items-center
					rounded-lg
					text-zinc-400
					hover:text-skyBlue-500 focus:text-white focus:outline-none"
				>
					<CircleX />
				</button>

				<NetworkSwitch currentNetwork={network} class="" />
			</section>

			<hr class=" border border-mineShaft-950" />

			<section id="accounts" class="grid gap-4 pt-2">
				<header class="flex items-center justify-between">
					<span class="text-xl font-semibold">Accounts</span>
					<button
						onclick={addSession}
						class=" flex h-12 items-center gap-2 rounded-lg border-2 border-mineShaft-600 px-4 text-mineShaft-100"
					>
						<UserPlus class="size-4" />
						<span>Add account</span>
					</button>
				</header>

				<!-- {#if context.wharf.session} -->
				<!-- 	<p>{String(context.wharf.session.permissionLevel)}</p> -->
				<!-- 	<p class="truncate">{String(context.wharf.session.chain.id)}</p> -->
				<!-- {/if} -->

				<!-- <Button href={`/${network}/signup`} onclick={closeDrawer} variant="secondary"
						>Signup</Button
					> <!-- {#if context.wharf.session} -->
				<!-- 	<Button onclick={() => removeSession(currentSession)} variant="secondary"> -->
				<!-- 		Logout ({context.wharf.session.actor}) -->
				<!-- 	</Button> -->
				<!-- {/if} -->
				<!-- {#if context.wharf.sessions.length} -->
				<!-- 	<Button onclick={removeAllSessions} variant="secondary">Logout (All Accounts)</Button> -->
				<!-- {/if} -->

				<ul class="grid gap-2">
					{#each context.wharf.sessions as session}
						{#if network.chain.id.equals(session.chain)}
							{@const isCurrent = currentSession?.actor.toString() === session.actor}
							{console.log(currentSession?.actor.toString(), session.actor)}
							<li class="grid grid-cols-[1fr_auto] gap-2">
								<button
									data-current={isCurrent}
									onclick={() => switchSession(session)}
									class="flex h-12 items-center gap-1 rounded-lg px-4
									data-[current=true]:bg-skyBlue-500
									data-[current=true]:text-skyBlue-950
									"
								>
									<div class="w-6">
										{#if isCurrent}
											<UserCheck class="ml-0.5 size-4 stroke-2" />
										{:else}
											<User class="size-4" />
										{/if}
									</div>

									<span>
										{session.actor}@{session.permission}
									</span>
								</button>
								<button
									onclick={() => removeSession(session)}
									data-current={isCurrent}
									class="grid size-12 place-items-center rounded-lg"
								>
									<LogOut class="size-4" />
								</button>
							</li>
						{/if}
					{/each}
				</ul>
			</section>
		</div>
	</div>
{/if}
