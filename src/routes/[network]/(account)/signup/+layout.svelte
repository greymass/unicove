<script lang="ts" context="module">
	export interface SignupStep {
		title: string;
		path: string;
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { getWalletType } from './walletTypes.js';

	const { data, children } = $props();

	const steps: SignupStep[] = [
		{
			title: 'Select Environment',
			path: `/${data.network}/signup`
		},
		{
			title: 'Select Wallet',
			path: `/${data.network}/signup/wallets`
		},
		{
			title: 'Setup Wallet',
			path: `/${data.network}/signup/wallets/${getWalletType($page.url.pathname)?.type}`
		}
	];

	function getCurrentStep() {
		let currentStep: SignupStep | undefined;

		steps.forEach((step) => {
			if (
				$page.url.pathname.includes(step.path) &&
				step.path.length > (currentStep?.path.length || 0)
			) {
				currentStep = step;
			}
		});

		return currentStep;
	}

	function isFutureStep(stepIndex: number) {
		const currentStep = getCurrentStep();
		if (!currentStep) return false;
		return stepIndex > steps.indexOf(currentStep);
	}

	function getFullStepPath(step: SignupStep) {
		if (step.title === 'Environment') {
			const walletType = getWalletType($page.url.pathname);

			return `${step.path}/${walletType?.type || ''}`;
		}

		return step.path;
	}

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<Stack>
	<Pageheader title="Sign Up" subtitle="Setup your account" />

	<!-- Step progress -->
	<ol class="mb-4 flex justify-between gap-5">
		{#each steps as step, index}
			{@const isCurrentStep = step.path === getCurrentStep()?.path}
			{@const isIncompleteStep = isCurrentStep || isFutureStep(index)}
			<li class="grid flex-1">
				<a
					href={getFullStepPath(step)}
					data-current={isCurrentStep}
					data-incomplete={isIncompleteStep}
					class="relative flex flex-col justify-between gap-2 text-white/50 hover:text-white/80 focus-visible:outline focus-visible:outline-offset-2
 focus-visible:outline-solar-500 data-[incomplete=true]:pointer-events-none data-[current=true]:text-white
					"
					tabindex={isIncompleteStep ? -1 : 0}
				>
					<span> Step {index + 1}: {step.title} </span>

					<!-- Bottom indicator -->
					<div
						data-incomplete={isIncompleteStep}
						class="h-1 w-full rounded-full data-[incomplete=false]:bg-skyBlue-400 data-[incomplete=true]:bg-white/10"
					></div>
					{#if isCurrentStep}
						<div
							in:send={{ key: 'step' }}
							out:receive={{ key: 'step' }}
							class="absolute bottom-0 left-1/2 h-1 w-full -translate-x-1/2 rounded-full bg-skyBlue-400"
						></div>
					{/if}
				</a>
			</li>
		{/each}
	</ol>

	<div class="relative">
		<Stack
			class="gap-6 *:z-10 before:absolute before:-inset-4 before:z-0 before:bg-shark-900/10 md:mx-auto md:max-w-md md:p-6 md:pb-10 md:before:inset-0 md:before:rounded-2xl"
		>
			{@render children()}
		</Stack>
	</div>
</Stack>
