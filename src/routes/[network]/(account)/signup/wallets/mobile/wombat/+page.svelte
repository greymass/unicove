<script lang="ts">
	// import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import {Button} from 'unicove-components';

	let { data } = $props();
</script>

<Stack>
	<!-- <Pageheader -->
	<!-- 	title="Setup Wombat Wallet" -->
	<!-- 	subtitle="Follow these steps to get started with Wombat on your mobile device" -->
	<!-- /> -->

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			<li>
				<h2 class="mb-2 text-xl font-semibold">Download Wombat</h2>
				<p class="mb-2">
					Visit your device's app store (Google Play Store for Android or App Store for iOS) to
					download the Wombat wallet application.
				</p>
				<Button href="https://www.getwombat.io/" blank rel="noopener noreferrer"
					>Download Wombat</Button
				>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Install the App</h2>
				<p class="mb-2">
					Tap the "Install" button and wait for Wombat to download and install on your device.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Launch Wombat</h2>
				<p class="mb-2">
					Open the Wombat app by tapping its icon on your device's home screen or app drawer.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Create a New Wallet</h2>
				<p class="mb-2">
					In Wombat, follow the prompts to create a new wallet. You may need to set up a PIN or use
					biometric authentication for security.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Secure Your Wallet</h2>
				<p class="mb-2">
					Write down your recovery phrase and store it in a safe place. This is crucial for account
					recovery and should never be shared.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Visit the Welcome Page</h2>
				<p class="mb-2">
					Visit the Wombat <a href="/en/{data.network}/welcome/wombat">welcome page</a> for next steps.
				</p>
			</li>
		</ol>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Why Choose Wombat?</h2>
			<ul class="list-disc space-y-2 pl-5">
				<li>User-friendly interface designed for simplicity</li>
				<li>Multi-chain support including EOS and other popular blockchains</li>
				<li>Built-in dApp browser for easy access to decentralized applications</li>
				<li>Fast and secure transactions</li>
				<li>Regular updates and new features to enhance user experience</li>
				<li>Cross-platform availability (mobile and browser extension)</li>
				<li>Smooth onboarding experience for crypto newcomers</li>
			</ul>
		</div>
	</div>
</Stack>
