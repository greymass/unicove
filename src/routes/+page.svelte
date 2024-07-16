<script>
	import { user } from '$lib/wharf';
</script>

<h3>{m.active_session()}</h3>
{#if user}
	{#if user.session}
		<p>Current: {user.session.actor}</p>
		<button onclick={() => user.logout(user.session)}>Logout current account</button>
		<button onclick={() => user.logout()}>Logout all accounts</button>
	{/if}

	<h3>Sessions</h3>
	<button onclick={() => user.login()}>Login</button>
	{#each user.sessions as session}
		<p>
			<button onclick={() => user.switch(session)}>
				Switch: {session.actor}@{session.permission} ({session.chain})
			</button>
		</p>
	{/each}
{/if}
