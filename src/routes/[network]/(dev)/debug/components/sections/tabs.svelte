<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import { createTabs, melt } from '@melt-ui/svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';

	const {
		elements: { root, list, content, trigger },
		states: { value }
	} = createTabs({
		defaultValue: 'tab-1'
	});

	const triggers = [
		{ id: 'tab-1', title: 'Account' },
		{ id: 'tab-2', title: 'Password' },
		{ id: 'tab-3', title: 'Settings' }
	];

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<Stack id="tabs" class="gap-8">
	<h2 class="h2">Tabs</h2>

	<div use:melt={$root} class={'grid gap-7'}>
		<div use:melt={$list} class="flex justify-between gap-5" aria-label="Manage your account">
			{#each triggers as triggerItem}
				<button
					use:melt={$trigger(triggerItem.id)}
					class="trigger relative flex flex-1 flex-col items-start gap-2 text-white/50 data-[active=true]:text-white"
					data-active={$value === triggerItem.id}
				>
					{triggerItem.title}
					<div class="h-1 w-full rounded-full bg-white/10"></div>
					{#if $value === triggerItem.id}
						<div
							in:send={{ key: 'trigger' }}
							out:receive={{ key: 'trigger' }}
							class="absolute bottom-0 left-1/2 h-1 w-full -translate-x-1/2 rounded-full bg-skyBlue-400"
						></div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Would pass an entire page here as a component -->
		<div use:melt={$content('tab-1')} class="">
			<p class="">Choose a wallet here...</p>
			<p class="">Choose a wallet here...</p>
			<p class="">Choose a wallet here...</p>
			<p class="">Choose a wallet here...</p>
			<p class="">Choose a wallet here...</p>
		</div>

		<!-- Would pass an entire page here as a component -->
		<div use:melt={$content('tab-2')} class="">
			<p class="">Pick a service here...</p>
			<p class="">Pick a service here...</p>
		</div>

		<!-- Would pass an entire page here as a component -->
		<div use:melt={$content('tab-3')} class="">
			<p class="">Setup your wallet now...</p>
			<p class="">Setup your wallet now...</p>
			<p class="">Setup your wallet now...</p>
			<p class="">Setup your wallet now...</p>
		</div>
	</div>
</Stack>
