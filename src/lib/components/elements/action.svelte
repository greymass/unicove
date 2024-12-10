<script lang="ts">
	import { Serializer, type Action } from '@wharfkit/antelope';
	import Code from '../code.svelte';
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { DL, DLRow, DD } from '../descriptionlist';
	import { Stack } from '../layout';
	import Account from './account.svelte';

	interface Props {
		action: Action;
	}

	let { action }: Props = $props();
	let { network } = getContext<UnicoveContext>('state');

	let humanReadable = $state({});

	onMount(async () => {
		const abi = await network.abis?.getAbi(action.account);
		if (abi) {
			const decoded = action.decodeData(abi);
			humanReadable = Serializer.objectify(decoded) as Record<string, unknown>;
		}
	});

	// const arr = action.authorization.map((auth) => [Account, auth]);
	// let test = [Account];
</script>

{#if action}
	<div class="grid grid-cols-2 items-start gap-6">
		<Code>{JSON.stringify(humanReadable, null, 2)}</Code>
		<Stack class="gap-2">
			<h3 class="h4">{String(action.name)}</h3>
			<DL>
				<DLRow title="Contract">
					<DD>
						<Account name={action.account} contract />
					</DD>
				</DLRow>
				<DLRow title="Authorization">
					{#each action.authorization as auth}
						<DD>
							<Account name={auth.actor}>{auth}</Account>
						</DD>
					{/each}
				</DLRow>
			</DL>
		</Stack>
	</div>
{/if}
