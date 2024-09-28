<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	const steps = [
		{
			title: 'Download Wombat',
			description:
				"Visit the official Wombat website or your device's app store to download the Wombat wallet app.",
			link: 'https://www.getwombat.io/'
		},
		{
			title: 'Install the App',
			description:
				'Follow the installation instructions for your device to install the Wombat wallet app.'
		},
		{
			title: 'Create a New Account',
			description:
				'Open the Wombat app and select "Create a new account". Follow the prompts to set up your wallet.'
		},
		{
			title: 'Secure Your Account',
			description:
				'Write down your recovery phrase and store it in a safe place. This is crucial for account recovery.'
		},
		{
			title: 'Fund Your Wallet',
			description:
				'Transfer some cryptocurrency to your new Wombat wallet address to start using it.'
		}
	];
</script>

<Stack>
	<Pageheader
		title="Setup Wombat Wallet"
		subtitle="Follow these steps to get started with Wombat"
	/>

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			{#each steps as step, index}
				<li>
					<h2 class="mb-2 text-xl font-semibold">{step.title}</h2>
					<p class="mb-2">{step.description}</p>
					{#if step.link}
						<Button href={step.link} blank rel="noopener noreferrer">Visit Wombat Website</Button>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Why Choose Wombat?</h2>
			<ul class="list-disc space-y-2 pl-5">
				<li>User-friendly interface for beginners</li>
				<li>Supports multiple blockchains including EOS</li>
				<li>Built-in dApp browser for easy access to decentralized applications</li>
				<li>Secure storage for your digital assets</li>
			</ul>
		</div>
	</div>
</Stack>
