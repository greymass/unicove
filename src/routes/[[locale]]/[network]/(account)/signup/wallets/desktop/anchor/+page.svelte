<script lang="ts">
	// import Pageheader from '$lib/components/pageheader.svelte';
	import { Stack } from 'unicove-components';
	import { Button } from 'unicove-components';

	const steps = [
		{
			title: 'Download Anchor Desktop',
			description:
				'Visit the official Anchor website to download the Anchor desktop wallet application.',
			link: 'https://greymass.com/en/anchor/'
		},
		{
			title: 'Install the Desktop Application',
			description:
				'Run the installer and follow the on-screen instructions to install the Anchor desktop wallet on your computer.'
		},
		{
			title: 'Launch Anchor',
			description:
				"Open the Anchor desktop application from your computer's applications menu or desktop shortcut."
		},
		{
			title: 'Create a New Account',
			description:
				'In the Anchor desktop app, click on "Create New Account" and follow the prompts to set up your wallet.'
		},
		{
			title: 'Secure Your Account',
			description:
				'Write down your private key and store it in a safe place. This is crucial for account recovery and should never be shared.'
		},
		{
			title: 'Configure Desktop Settings',
			description:
				'Explore the settings to customize your experience, such as default networks and resource management preferences.'
		},
		{
			title: 'Fund Your Wallet',
			description:
				'Transfer some cryptocurrency to your new Anchor wallet address to start using it on your desktop.'
		}
	];
</script>

<Stack>
	<!-- <Pageheader -->
	<!-- 	title="Setup Anchor Desktop Wallet" -->
	<!-- 	subtitle="Follow these steps to get started with Anchor on your desktop" -->
	<!-- /> -->

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			{#each steps as step}
				<li>
					<h2 class="mb-2 text-xl font-semibold">{step.title}</h2>
					<p class="mb-2">{step.description}</p>
					{#if step.link}
						<Button href={step.link} blank rel="noopener noreferrer">Download Anchor Desktop</Button
						>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Why Choose Anchor Desktop?</h2>
			<ul class="list-disc space-y-2 pl-5">
				<li>Full-featured desktop application for enhanced functionality</li>
				<li>Improved security with local key storage on your computer</li>
				<li>Supports multiple EOSIO-based blockchains</li>
				<li>Advanced features for power users, including multi-sig support</li>
				<li>Regular updates and desktop-specific features</li>
				<li>Open-source software for transparency and community contributions</li>
			</ul>
		</div>
	</div>
</Stack>
