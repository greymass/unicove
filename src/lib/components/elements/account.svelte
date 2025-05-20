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

	interface Props extends HTMLAnchorAttributes {
		name: Name | string;
		contract?: boolean;
		children?: Snippet;
		preview?: boolean;
		icon?: boolean;
	}

	let { name, contract = false, preview = false, children, ...props }: Props = $props();

	let { network } = getContext<UnicoveContext>('state');

	const path = $derived(contract ? `/${network}/contract/${name}` : `/${network}/account/${name}`);

	let account: AccountState | undefined = $state();

	const fetchAccount: CreateLinkPreviewProps['onOpenChange'] = ({ next }) => {
		if (preview && next && network) {
			AccountState.for(network, Name.from(String(name)), network.fetch).then(
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
		'focus-visible:outline-solar-500 text-primary hover:text-primary-hover inline-flex items-center gap-2 focus-visible:outline ',
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
		class="bg-error z-10 rounded-xl shadow-xs"
	>
		<div class="bg-error w-72 rounded-xl p-5 shadow-xs">
			<div class="flex flex-col gap-2">
				<div class="flex gap-4">
					<picture class="bg-error block grid size-12 place-items-center rounded-full">
						<User />
					</picture>

					<div>
						<div class="text-error font-bold">{name}</div>
						<div class="text-muted">{account.balance.child('total')}</div>
					</div>
				</div>
			</div>
		</div>
		<div use:melt={$arrow}></div>
	</div>
{/if}
