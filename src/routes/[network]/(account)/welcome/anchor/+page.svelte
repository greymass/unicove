<script lang="ts">
	import { getContext } from 'svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	function loginWithAnchor() {
		context.wharf.login({ walletPlugin: 'anchor' });
	}
</script>

<Stack>
	<Pageheader title="Welcome to Anchor" subtitle="Your account is ready to use" />

	<div class="container mx-auto p-4">
		<p class="mb-6">
			Congratulations! Your Anchor account is now set up and ready to go. You're all set to start
			exploring the world of blockchain and decentralized applications.
		</p>

		<h2 class="mb-4 text-xl font-semibold">What's Next?</h2>
		<ul class="mb-6 list-disc space-y-2 pl-5">
			<li>Use your Anchor wallet to manage your digital assets</li>
			<li>Interact with decentralized applications (dApps)</li>
			<li>Participate in blockchain governance</li>
			<li>Explore the features of your new Anchor account</li>
		</ul>

		<p class="mb-6">To get started, simply log in to your Anchor account using the button below.</p>

		<Button on:click={loginWithAnchor}>Log In to Anchor</Button>

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Need Help?</h2>
			<p>
				If you have any questions or need assistance, don't hesitate to check out our <a
					href="/support"
					class="text-blue-500 hover:underline">support page</a
				> or reach out to our community forums.
			</p>
		</div>
	</div>
</Stack>
