<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { getWharf } from '$lib/state/client/wharf.svelte';
	import { Stack } from '../layout';
	import Button from '../button/button.svelte';
	import { Session, type SerializedSession } from '@wharfkit/session';
	import { chainMapper } from '$lib/wharf/chains';

	const wharf = getWharf();

	let currentSession = $derived(wharf.session);

	function closeDrawer() {
		$open = false;
	}

	function addSession() {
		wharf.login();
	}

	function switchSession(session: SerializedSession) {
		wharf.switch(session);
		closeDrawer();
	}

	function removeSession(session?: Session) {
		if (session) {
			wharf.logout(session);
		}
		closeDrawer();
	}

	function removeAllSessions() {
		wharf.logout();
		closeDrawer();
	}

	const {
		elements: { trigger, overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog({
		// defaultOpen: true,
		forceVisible: true
	});
</script>

<!-- [@media(any-hover:hover)]:hover:opacity-80 -->

<button
	class="
	relative
	m-0.5
	flex
	h-10
	items-center
	justify-between
	gap-2
	text-nowrap
	rounded-lg
	bg-skyBlue-500
	px-8
	py-3.5
	font-medium
	transition-opacity
	focus:outline-transparent
	focus-visible:outline
	focus-visible:ring-2
	focus-visible:ring-inset
	focus-visible:ring-solar-500
	"
	use:melt={$trigger}
	aria-label="account-switcher-label"
	id="account-switcher"
	data-session={!!wharf.session}
>
	{#if wharf.session}
		<span class="pointer-events-none z-10 text-skyBlue-950">{wharf.session.actor}</span>
	{:else}
		<span class="pointer-events-none z-10 text-skyBlue-950">Connect Wallet</span>
	{/if}
	<div
		class="absolute inset-0 rounded-[inherit] border-2 border-white bg-white opacity-0 transition-opacity hover:opacity-20 active:border-black active:bg-black"
	></div>
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
			<h2 use:melt={$title} class="h3 mb-0">Wharf State</h2>
			<p use:melt={$description} class="caption mb-4 mt-2">
				The state internal to the wharf service.
			</p>
			<section>
				<Stack class="">
					<h2 class="h2">Active session</h2>
					{#if wharf.session}
						<Stack>
							<Stack class="gap-0">
								<p class="caption">Account</p>
								<p>{String(wharf.session.permissionLevel)}</p>
							</Stack>
							<Stack class="gap-0">
								<p class="caption">Chain</p>
								<p class="truncate">{String(wharf.session.chain.id)}</p>
							</Stack>
						</Stack>
					{:else}
						No Session Active
					{/if}

					<h2 class="h2">Controls</h2>
					<Button onclick={addSession} variant="secondary">Login</Button>
					{#if wharf.session}
						<Button onclick={() => removeSession(currentSession)} variant="secondary">
							Logout ({wharf.session.actor})
						</Button>
					{/if}
					{#if wharf.sessions.length}
						<Button onclick={removeAllSessions} variant="secondary">Logout (All Accounts)</Button>
					{/if}

					<h2 class="h2">Sessions</h2>
					<p>The available sessions that can be used.</p>
					{#each wharf.sessions as session}
						<p>
							<Button onclick={() => switchSession(session)} variant="secondary">
								<span class="self-start">
									{session.actor}@{session.permission}
								</span>
								<span class="truncate">
									({chainMapper.toShortName(session.chain)})
								</span>
							</Button>
						</p>
					{/each}
				</Stack>
			</section>
			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex h-6 w-6
				appearance-none items-center justify-center rounded-full text-solar-800
				hover:bg-solar-100 focus:shadow-solar-400 focus:outline-none focus:ring-2
				focus:ring-solar-400"
			>
				X
			</button>
		</div>
	</div>
{/if}
