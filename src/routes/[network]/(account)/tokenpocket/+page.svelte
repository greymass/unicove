<script lang="ts">
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	const steps = [
		{
			title: 'Download TokenPocket',
			description:
				"Visit your device's app store (Google Play Store for Android or App Store for iOS) to download the TokenPocket wallet application.",
			link: 'https://www.tokenpocket.pro/en/download/app'
		},
		{
			title: 'Install the App',
			description:
				'Tap the "Install" button and wait for TokenPocket to download and install on your device.'
		},
		{
			title: 'Launch TokenPocket',
			description:
				"Open the TokenPocket app by tapping its icon on your device's home screen or app drawer."
		},
		{
			title: 'Create a New Wallet',
			description:
				'In TokenPocket, select "Create Wallet" and choose the blockchain you want to use (e.g., EOS). Follow the prompts to set up your wallet.'
		},
		{
			title: 'Secure Your Wallet',
			description:
				'Write down your recovery phrase and private key, storing them in a safe place. This is crucial for account recovery and should never be shared.'
		},
		{
			title: 'Configure Settings',
			description:
				'Explore the app settings to customize your experience, such as language preferences, network settings, and security options.'
		},
		{
			title: 'Fund Your Wallet',
			description:
				'Transfer some cryptocurrency to your new TokenPocket wallet address to start using it for transactions and dApps.'
		}
	];
</script>

<Stack>
	<Pageheader
		title="Setup TokenPocket Wallet"
		subtitle="Follow these steps to get started with TokenPocket on your device"
	/>

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			{#each steps as step, index}
				<li>
					<h2 class="mb-2 text-xl font-semibold">{step.title}</h2>
					<p class="mb-2">{step.description}</p>
					{#if step.link}
						<Button href={step.link} blank rel="noopener noreferrer">Download TokenPocket</Button>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Why Choose TokenPocket?</h2>
			<ul class="list-disc space-y-2 pl-5">
				<li>Multi-chain support including EOS, Ethereum, and many others</li>
				<li>User-friendly interface for managing multiple cryptocurrencies</li>
				<li>Built-in dApp browser for easy access to decentralized applications</li>
				<li>Secure storage with optional hardware wallet integration</li>
				<li>Regular updates and new features to enhance user experience</li>
				<li>Cross-platform availability (mobile and browser extension)</li>
				<li>Active community and support for troubleshooting</li>
			</ul>
		</div>
	</div>
</Stack>
