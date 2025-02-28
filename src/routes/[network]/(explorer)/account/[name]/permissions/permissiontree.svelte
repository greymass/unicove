<script lang="ts">
	import type { Name, PermissionLevel } from '@wharfkit/session';
	import Permission from './permission.svelte';
	import type { TreePermission } from './+page';

	interface Props {
		account: Name;
		advancedMode: boolean;
		currentUser: boolean;
		loggedIn: boolean;
		msigMode: boolean;
		signin: (auth: PermissionLevel) => Promise<void>;
		permissions: TreePermission[];
		level?: number;
	}
	let props: Props = $props();
</script>

<ul class="grid grid-cols-[auto_1fr] overflow-x-auto">
	{#each props.permissions as permission}
		<Permission
			account={props.account}
			advancedMode={props.advancedMode}
			currentUser={props.currentUser}
			loggedIn={props.loggedIn}
			msigMode={props.msigMode}
			signin={props.signin}
			{permission}
		/>
	{/each}
</ul>
