<script lang="ts">
	// import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	const steps = [
		{
			title: 'Download Anchor Mobile',
			description:
				"Visit your device's app store (Google Play Store for Android or App Store for iOS) to download the Anchor mobile wallet application.",
			link: 'https://greymass.com/en/anchor/'
		},
		{
			title: 'Install the Mobile App',
			description:
				'Tap the "Install" button and wait for the Anchor mobile app to download and install on your device.'
		},
		{
			title: 'Launch Anchor',
			description:
				"Open the Anchor mobile app by tapping its icon on your device's home screen or app drawer."
		},
		{
			title: 'Create a New Account',
			description:
				'In the Anchor mobile app, tap on "Create New Account" and follow the on-screen prompts to set up your wallet.'
		},
		{
			title: 'Secure Your Account',
			description:
				'Write down your private key and store it in a safe place. This is crucial for account recovery and should never be shared or stored digitally.'
		},
		{
			title: 'Configure Mobile Settings',
			description:
				'Explore the mobile-specific settings to customize your experience, such as biometric authentication and push notification preferences.'
		},
		{
			title: 'Fund Your Wallet',
			description:
				'Transfer some cryptocurrency to your new Anchor wallet address to start using it on your mobile device.'
		}
	];
</script>

<Stack>
	<!-- <Pageheader -->
	<!-- 	title="Setup Anchor Mobile Wallet" -->
	<!-- 	subtitle="Follow these steps to get started with Anchor on your mobile device" -->
	<!-- /> -->

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			{#each steps as step}
				<li>
					<h2 class="mb-2 text-xl font-semibold">{step.title}</h2>
					<p class="mb-2">{step.description}</p>
					{#if step.link}
						<Button href={step.link} blank rel="noopener noreferrer">Download Anchor Mobile</Button>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Why Choose Anchor Mobile?</h2>
			<ul class="list-disc space-y-2 pl-5">
				<li>User-friendly mobile interface for on-the-go access</li>
				<li>Secure storage of your digital assets on your mobile device</li>
				<li>Quick and easy transactions from your smartphone</li>
				<li>Supports multiple EOSIO-based blockchains</li>
				<li>Built-in dApp browser for mobile-optimized decentralized applications</li>
				<li>Biometric authentication for enhanced security</li>
				<li>Push notifications for important wallet activities</li>
				<li>Open-source software for transparency and community contributions</li>
			</ul>
		</div>
	</div>
</Stack>
