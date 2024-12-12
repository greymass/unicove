<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext, type Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { createLinkPreview, melt, type CreateLinkPreviewProps } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import { User, UserIcon } from 'lucide-svelte';
	import { Name } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { AccountState } from '$lib/state/client/account.svelte';
	import { page } from '$app/stores';

	interface Props extends HTMLAnchorAttributes {
		name: Name | string;
		contract?: boolean;
		children?: Snippet;
		preview?: boolean;
		icon?: boolean;
	}

	let { name, contract = false, preview = false, children, ...props }: Props = $props();

	let { network } = getContext<UnicoveContext>('state');

	const path = $derived(
		contract
			? '/' + $page.params.network + '/contract/' + name
			: '/' + $page.params.network + '/account/' + name
	);

	let account: AccountState | undefined = $state();

	const fetchAccount: CreateLinkPreviewProps['onOpenChange'] = ({ next }) => {
		if (preview && next && network) {
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
	class={cn(
		'inline-flex items-center gap-2 text-skyBlue-500 hover:text-skyBlue-400 focus-visible:outline focus-visible:outline-solar-500 ',
		props.class
	)}
	use:melt={$trigger}
>
	{#if props.icon}
		<UserIcon class="size-4" />
	{/if}
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
