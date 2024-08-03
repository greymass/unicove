<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { Stack } from '$lib/components/layout';
	import { getWharf } from '$lib/state/client/wharf.svelte';

	const wharf = getWharf();
</script>

<Stack class="items-start">
	<h2 class="h2">Wharf State</h2>
	<p>The state internal to the wharf service.</p>
	<h2 class="h2">controls</h2>
	<Button onclick={() => wharf.login()} variant="secondary">Login</Button>
	{#if wharf.session}
		<Button onclick={() => wharf.logout(wharf.session)} variant="secondary">
			Logout ({wharf.session.actor})
		</Button>
	{/if}
	{#if wharf.sessions.length}
		<Button onclick={() => wharf.logout()} variant="secondary">Logout (All Accounts)</Button>
	{/if}
	<h2 class="h2">session</h2>
	<p>The currently active session.</p>
	{#if wharf.session}
		<table>
			<tbody>
				<tr>
					<td>Account</td>
					<td>{String(wharf.session.permissionLevel)}</td>
				</tr>
				<tr>
					<td>Chain</td>
					<td>{String(wharf.session.chain.id)}</td>
				</tr>
			</tbody>
		</table>
	{:else}
		No Session Active
	{/if}
	<h2 class="h2">sessions</h2>
	<p>The available sessions that can be used.</p>
	{#each wharf.sessions as session}
		<p>
			<Button onclick={() => wharf.switch(session)} variant="secondary">
				Switch: {session.actor}@{session.permission} ({session.chain})
			</Button>
		</p>
	{/each}
</Stack>
