<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const network = $page.params.network;

	const signupMethods = [
		{ name: 'Anchor', route: `/${network}/anchor` },
		{ name: 'MetaMask', route: `/${network}/metamask` },
		{ name: 'TokenPocket', route: `/${network}/tokenpocket` },
		{ name: 'Wombat', route: `/${network}/wombat` }
	];
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Signup</h1>
	<p class="mb-4">Signup Methods:</p>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each signupMethods as method}
			<div class="card rounded-lg border p-4">
				<h2 class="mb-2 text-xl font-semibold">{method.name}</h2>
				<Button on:click={() => goto(method.route)}>{method.name}</Button>
			</div>
		{/each}
	</div>
</div>
