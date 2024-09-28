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
	import { getWalletType, walletTypes } from './walletTypes.js';

	const { data } = $props();

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
		console.log({ step });
		if (step.title === 'Environment') {
			const walletType = getWalletType($page.url.pathname);

			return `${step.path}/${walletType?.type || ''}`;
		}

		return step.path;
	}
</script>

<Stack>
	<Pageheader title="Sign Up" subtitle="Setup your account" />

	<div class="mb-6 flex justify-start space-x-4">
		{#each steps as step, index}
			{@const isCurrentStep = step.path === getCurrentStep()?.path}
			{#if isCurrentStep || isFutureStep(index)}
				<div
					class="text-lg font-medium {isCurrentStep ? 'text-primary underline' : 'text-gray-500'}"
				>
					Step {index + 1}: {step.title}
				</div>
			{:else}
				<a
					href={getFullStepPath(step)}
					class="hover:text-primary text-lg font-medium text-gray-500 hover:underline"
				>
					Step {index + 1}: {step.title}
				</a>
			{/if}
		{/each}
	</div>

	<div>
		<slot />
	</div>
</Stack>
