<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { Session, type SerializedSession } from '@wharfkit/session';
	import { chainLogos } from '@wharfkit/common';

	import { chainMapper, chainShortNames } from '$lib/wharf/chains';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	import { Stack } from '$lib/components/layout';
	import Button from '../button/button.svelte';

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

	function removeSession(session?: Session) {
		if (session) {
			context.wharf.logout(session);
		}
		closeDrawer();
	}

	function removeAllSessions() {
		context.wharf.logout();
		closeDrawer();
	}

	const {
		elements: { trigger, overlay, content, title, close, portalled },
		states: { open }
	} = createDialog({
		// defaultOpen: true,
		forceVisible: true
	});

	let logo = $derived(chainLogos.get(String(context.wharf.session?.chain.id)) || '');
</script>

<!-- [@media(any-hover:hover)]:hover:opacity-80 -->

<button
	class="
	relative
	z-50
	flex
	h-10
	items-center
	gap-2
	text-nowrap
	text-base
	font-medium
	transition-opacity
	hover:border-y
	hover:border-b-skyBlue-400
	hover:border-t-transparent
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
		<img src={String(logo)} alt={context.wharf.session.chain.name} class="w-4" />
		<span class="pointer-events-none z-10">{context.wharf.session.actor}</span>
	{:else}
		<span class="pointer-events-none z-10">Connect Wallet</span>
	{/if}
</button>

{#if $open}
	<div class="" use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			use:melt={$content}
			class="fixed right-0 top-0 z-50 h-svh w-full max-w-[350px] overflow-y-auto overflow-x-hidden bg-shark-950
			p-6 shadow-lg focus:outline-none"
			transition:fly={{
				x: 350,
				duration: 300,
				opacity: 1
			}}
		>
			<h2 use:melt={$title} class="h3 mb-0">{network}</h2>
			<section>
				<Stack class="">
					{#if context.wharf.session}
						<Stack>
							<Stack class="gap-0">
								<p class="caption">Account</p>
								<p>{String(context.wharf.session.permissionLevel)}</p>
							</Stack>
							<Stack class="gap-0">
								<p class="caption">Chain</p>
								<p class="truncate">{String(context.wharf.session.chain.id)}</p>
							</Stack>
						</Stack>
					{:else}
						Not logged in
					{/if}

					<h2 class="h2">Controls</h2>
					<Button onclick={addSession} variant="secondary">Login</Button>
					<Button href={`/${network}/signup`} onclick={closeDrawer} variant="secondary"
						>Signup</Button
					>
					{#if context.wharf.session}
						<Button onclick={() => removeSession(currentSession)} variant="secondary">
							Logout ({context.wharf.session.actor})
						</Button>
					{/if}
					{#if context.wharf.sessions.length}
						<Button onclick={removeAllSessions} variant="secondary">Logout (All Accounts)</Button>
					{/if}

					<h2 class="h2">Sessions</h2>
					<p>The available sessions that can be used.</p>
					{#each context.wharf.sessions as session}
						{#if network.chain.id.equals(session.chain)}
							<Button onclick={() => switchSession(session)} variant="secondary">
								<span class="self-start">
									{session.actor}@{session.permission}
								</span>
								<span class="truncate">
									({chainMapper.toShortName(String(session.chain))})
								</span>
							</Button>
						{/if}
					{/each}

					<h2 class="h2">Switch Network</h2>
					{#each chainShortNames as chain}
						{@const isCurrent = chain === String(network)}
						<Button variant={isCurrent ? 'secondary' : 'primary'} href={`/${chain}`}>
							{chain}
							{isCurrent ? '(Selected)' : ''}
						</Button>
					{/each}
				</Stack>
			</section>
			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex h-6 w-6
				appearance-none items-center justify-center rounded-full text-skyBlue-800
				hover:bg-skyBlue-100 focus:shadow-skyBlue-400 focus:outline-none focus:ring-2
				focus:ring-skyBlue-400"
			>
				X
			</button>
		</div>
	</div>
{/if}
