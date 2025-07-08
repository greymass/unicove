<script lang="ts">
	interface SignupStep {
		title: string;
		path: string;
	}

	import { page } from '$app/stores';
	import { Stack } from 'unicove-components';
	// import Pageheader from '$lib/components/pageheader.svelte';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { getWalletNameFromPath, getWalletTypeFromPath } from './walletTypes.js';

	import { i18n } from '$lib/i18n';

	const { data, children } = $props();

	const locale = i18n.getLanguageFromUrl($page.url);

	let steps: SignupStep[] = $derived([
		{
			title: 'Get Started',
			path: `/${data.network}/signup`
		},
		{
			title: 'Select Environment',
			path: `/${data.network}/signup/wallets`
		},
		{
			title: 'Select Wallet',
			path: `/${data.network}/signup/wallets/${getWalletTypeFromPath($page.url.pathname)?.type}`
		},
		{
			title: 'Setup Wallet',
			path: `/${data.network}/signup/wallets/${getWalletTypeFromPath($page.url.pathname)?.type}/${getWalletNameFromPath($page.url.pathname)?.toLowerCase()}`
		}
	]);

	function getCurrentStep() {
		return steps.find((step) => {
			return $page.url.pathname.replace(`/${locale}`, '') === step.path;
		});
	}

	function isFutureStep(stepIndex: number) {
		const currentStep = getCurrentStep();
		if (!currentStep) return false;
		return stepIndex > steps.indexOf(currentStep);
	}

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<Stack tag="article" class="gap-6">
	<!-- Step progress -->
	<ol class="mb-4 flex hidden justify-between gap-5">
		{#each steps as step, index}
			{@const isCurrentStep = step.path === getCurrentStep()?.path}
			{@const isIncompleteStep = isCurrentStep || isFutureStep(index)}
			<li class="grid flex-1">
				<a
					href={step.path}
					data-current={isCurrentStep}
					data-incomplete={isIncompleteStep}
					class="focus-visible:outline-solar-500 text-on-surface/50 hover:text-on-surface/80 data-[current=true]:text-on-surface relative flex flex-col justify-between gap-2
 focus-visible:outline focus-visible:outline-offset-2 data-[incomplete=true]:pointer-events-none
					"
					tabindex={isIncompleteStep ? -1 : 0}
				>
					<span> Step {index + 1}: {step.title} </span>

					<!-- Bottom indicator -->
					<div
						data-incomplete={isIncompleteStep}
						class="data-[incomplete=false]:bg-primary data-[incomplete=true]:bg-surface h-1 w-full rounded-full"
					></div>
					{#if isCurrentStep}
						<div
							in:send={{ key: 'step' }}
							out:receive={{ key: 'step' }}
							class="bg-primary absolute bottom-0 left-1/2 h-1 w-full -translate-x-1/2 rounded-full"
						></div>
					{/if}
				</a>
			</li>
		{/each}
	</ol>

	<div class="relative">
		<Stack
			class="before:bg-surface-container gap-6 *:z-10 before:absolute before:-inset-4 before:z-0 md:mx-auto md:max-w-md md:p-6 md:pb-10 md:before:inset-0 md:before:rounded-2xl"
		>
			{@render children()}
		</Stack>
	</div>
</Stack>
