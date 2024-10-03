<script lang="ts">
	import { page } from '$app/stores';

	$: network = $page.params.network;

	$: signupMethods = [
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
				<a href={method.route} class="mb-2 text-xl font-semibold">{method.name}</a>
			</div>
		{/each}
	</div>
</div>
