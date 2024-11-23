<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext, type Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { createLinkPreview, melt, type CreateLinkPreviewProps } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import { User } from 'lucide-svelte';
	import { Name } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { AccountState } from '$lib/state/client/account.svelte';
	import { page } from '$app/stores';

	interface Props extends HTMLAnchorAttributes {
		name: string;
		contract?: boolean;
		children?: Snippet;
	}

	let { name, contract = false, children, ...props }: Props = $props();

	let context = getContext<UnicoveContext>('state');

	let network = $derived(context.network);

	$inspect(network);

	const path = $derived(
		contract
			? '/' + $page.params.network + '/contract/' + name
			: '/' + $page.params.network + '/account/' + name
	);

	let account: AccountState | undefined = $state();

	const fetchAccount: CreateLinkPreviewProps['onOpenChange'] = ({ next }) => {
		if (next && network) {
			AccountState.for(network, Name.from(String(name)), fetch).then(
				(accountState) => (account = accountState)
			);
		}
		return next;
	};

	const {
		elements: { trigger, content, arrow },
		states: { open }
	} = createLinkPreview({
		forceVisible: true,
		onOpenChange: fetchAccount,
		openDelay: 500
	});
</script>

<a
	href={path}
	class={cn('focus-visible:outline focus-visible:outline-solar-500 ', props.class)}
	use:melt={$trigger}
>
	{#if children}
		{@render children()}
	{:else}
		{name}
	{/if}
</a>

{#if $open && account}
	<div
		use:melt={$content}
		transition:fly={{ y: -5, duration: 100 }}
		class="z-10 rounded-xl bg-mineShaft-900 shadow-sm"
	>
		<div class="w-72 rounded-xl bg-mineShaft-900 p-5 shadow-sm">
			<div class="flex flex-col gap-2">
				<div class="flex gap-4">
					<picture class="block grid size-12 place-items-center rounded-full bg-mineShaft-700">
						<User />
					</picture>

					<div>
						<div class="font-bold text-mineShaft-50">{name}</div>
						<div class="text-muted">{account.balance?.total}</div>
					</div>
				</div>
			</div>
		</div>
		<div use:melt={$arrow}></div>
	</div>
{/if}
