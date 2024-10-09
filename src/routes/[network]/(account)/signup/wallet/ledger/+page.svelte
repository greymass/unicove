<script lang="ts">
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	const steps = [
		{
			title: 'Purchase a Ledger Device',
			description:
				'Buy a Ledger hardware wallet from the official Ledger website or an authorized reseller.',
			link: 'https://www.ledger.com/'
		},
		{
			title: 'Set Up Your Ledger',
			description:
				'Follow the instructions provided with your Ledger device to set it up and create a new wallet.'
		},
		{
			title: 'Install Ledger Live',
			description:
				'Download and install Ledger Live software on your computer to manage your device and cryptocurrencies.',
			link: 'https://www.ledger.com/ledger-live'
		},
		{
			title: 'Install the EOS App',
			description: 'Use Ledger Live to install the EOS app on your Ledger device.'
		},
		{
			title: 'Connect to EOS Network',
			description:
				'Use a compatible EOS wallet interface that supports Ledger to connect your device and interact with the EOS network.'
		}
	];
</script>

<Stack>
	<Pageheader
		title="Setup Ledger Wallet"
		subtitle="Follow these steps to get started with your Ledger hardware wallet"
	/>

	<div class="container mx-auto p-4">
		<ol class="list-decimal space-y-6 pl-5">
			{#each steps as step}
				<li>
					<h2 class="mb-2 text-xl font-semibold">{step.title}</h2>
					<p class="mb-2">{step.description}</p>
					{#if step.link}
						<Button href={step.link} blank rel="noopener noreferrer">Visit Ledger Website</Button>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Why Choose Ledger?</h2>
			<ul class="list-disc space-y-2 pl-5">
				<li>Highest level of security for your cryptocurrencies</li>
				<li>Supports a wide range of cryptocurrencies, including EOS</li>
				<li>User-friendly interface with Ledger Live software</li>
				<li>Offline storage of private keys for enhanced protection</li>
				<li>Regular firmware updates to maintain security and add new features</li>
			</ul>
		</div>
	</div>
</Stack>
