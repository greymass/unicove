<script lang="ts">
	// import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	let { data } = $props();
</script>

<Stack>
	<!-- <Pageheader -->
	<!-- 	title="Setup TokenPocket Wallet" -->
	<!-- 	subtitle="Follow these steps to get started with TokenPocket on your device" -->
	<!-- /> -->

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			<li>
				<h2 class="mb-2 text-xl font-semibold">Download TokenPocket</h2>
				<p class="mb-2">
					Visit your device's app store (Google Play Store for Android or App Store for iOS) to
					download the TokenPocket wallet application.
				</p>
				<Button href="https://www.tokenpocket.pro/en/download/app" blank rel="noopener noreferrer"
					>Download TokenPocket</Button
				>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Install the App</h2>
				<p class="mb-2">
					Tap the "Install" button and wait for TokenPocket to download and install on your device.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Launch TokenPocket</h2>
				<p class="mb-2">
					Open the TokenPocket app by tapping its icon on your device's home screen or app drawer.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Create a New Wallet</h2>
				<p class="mb-2">
					In TokenPocket, select "Create Wallet" and choose the blockchain you want to use (e.g.,
					EOS). Follow the prompts to set up your wallet.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Secure Your Wallet</h2>
				<p class="mb-2">
					Write down your recovery phrase and private key, storing them in a safe place. This is
					crucial for account recovery and should never be shared.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold">Visit the Welcome Page</h2>
				<p class="mb-2">
					Visit the TokenPocket <a href="/en/{data.network}/welcome/tokenpocker">welcome page</a> for
					next steps.
				</p>
			</li>
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
