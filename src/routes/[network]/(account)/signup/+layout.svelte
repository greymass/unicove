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
			title: 'Signup',
			path: `/${data.network}/signup`
		},
		{
			title: 'Environment',
			path: `/${data.network}/signup/wallet-type`
		},
		{
			title: 'Wallet',
			path: `/${data.network}/signup/wallet`
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
	<ol class="mb-7 flex justify-between gap-5">
		{#each steps as step, index}
			{@const isCurrentStep = step.path === getCurrentStep()?.path}
			<li class="flex-1">
				<a
					href={getFullStepPath(step)}
					data-current={isCurrentStep}
					data-incomplete={isCurrentStep || isFutureStep(index)}
					class="relative flex flex-col gap-2 text-white/50 hover:text-white/80 data-[incomplete=true]:pointer-events-none data-[current=true]:text-white"
				>
					<span> Step {index + 1}: {step.title} </span>

					<!-- Bottom indicator -->
					<div class="h-1 w-full rounded-full bg-white/10"></div>
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

	<div>
		{@render children()}
	</div>
</Stack>
