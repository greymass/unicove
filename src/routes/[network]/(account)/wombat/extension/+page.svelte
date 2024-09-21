<script lang="ts">
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	const steps = [
		{
			title: 'Install Wombat Extension',
			description:
				'Visit the Chrome Web Store to download and install the Wombat browser extension.',
			link: 'https://www.getwombat.io/'
		},
		{
			title: 'Add to Chrome',
			description: 'Click "Add to Chrome" and confirm the installation when prompted.'
		},
		{
			title: 'Open Wombat Extension',
			description: 'Click on the Wombat icon in your browser toolbar to open the extension.'
		},
		{
			title: 'Create a New Account',
			description:
				'In the Wombat extension, select "Create a new account" and follow the on-screen instructions to set up your wallet.'
		},
		{
			title: 'Secure Your Account',
			description:
				'Write down your recovery phrase and store it in a safe place. This is crucial for account recovery and should never be shared.'
		},
		{
			title: 'Configure Extension Settings',
			description:
				'Explore the extension settings to customize your experience, such as auto-lock timers and network preferences.'
		},
		{
			title: 'Fund Your Wallet',
			description:
				'Transfer some cryptocurrency to your new Wombat wallet address to start using it with dApps in your browser.'
		}
	];
</script>

<Stack>
	<Pageheader
		title="Setup Wombat Browser Extension"
		subtitle="Follow these steps to get started with the Wombat Chrome extension"
	/>

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			{#each steps as step, index}
				<li>
					<h2 class="mb-2 text-xl font-semibold">{step.title}</h2>
					<p class="mb-2">{step.description}</p>
					{#if step.link}
						<Button href={step.link} blank rel="noopener noreferrer"
							>Install Wombat Extension</Button
						>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Why Choose Wombat Browser Extension?</h2>
			<ul class="list-disc space-y-2 pl-5">
				<li>Seamless integration with web-based dApps</li>
				<li>Quick access to your wallet directly from your browser</li>
				<li>Supports multiple blockchains including EOS</li>
				<li>Enhanced security with browser isolation</li>
				<li>Easy-to-use interface for managing your digital assets</li>
				<li>Regular updates and new features through the Chrome Web Store</li>
			</ul>
		</div>
	</div>
</Stack>
