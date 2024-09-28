<script lang="ts">
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	const steps = [
		{
			title: 'Download Wombat Desktop',
			description:
				'Visit the official Wombat website to download the Wombat desktop wallet application.',
			link: 'https://www.getwombat.io'
		},
		{
			title: 'Install the Desktop Application',
			description:
				'Run the installer and follow the on-screen instructions to install the Wombat desktop wallet on your computer.'
		},
		{
			title: 'Launch Wombat',
			description:
				"Open the Wombat desktop application from your computer's applications menu or desktop shortcut."
		},
		{
			title: 'Create a New Account',
			description:
				'In the Wombat desktop app, click on "Create a new account" and follow the prompts to set up your wallet.'
		},
		{
			title: 'Secure Your Account',
			description:
				'Write down your recovery phrase and store it in a safe place. This is crucial for account recovery and should never be shared.'
		},
		{
			title: 'Configure Desktop Settings',
			description:
				'Explore the desktop-specific settings to customize your experience, such as auto-updates and notification preferences.'
		},
		{
			title: 'Fund Your Wallet',
			description:
				'Transfer some cryptocurrency to your new Wombat wallet address to start using it on your desktop.'
		}
	];
</script>

<Stack>
	<Pageheader
		title="Setup Wombat Desktop Wallet"
		subtitle="Follow these steps to get started with Wombat on your desktop"
	/>

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			{#each steps as step, index}
				<li>
					<h2 class="mb-2 text-xl font-semibold">{step.title}</h2>
					<p class="mb-2">{step.description}</p>
					{#if step.link}
						<Button href={step.link} blank rel="noopener noreferrer">Download Wombat Desktop</Button
						>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Why Choose Wombat Desktop?</h2>
			<ul class="list-disc space-y-2 pl-5">
				<li>Full-featured desktop application for enhanced functionality</li>
				<li>Improved security with local key storage on your computer</li>
				<li>Faster transaction processing compared to web-based wallets</li>
				<li>Supports multiple blockchains including EOS</li>
				<li>Seamless integration with desktop dApps and tools</li>
				<li>Regular updates and desktop-specific features</li>
			</ul>
		</div>
	</div>
</Stack>
