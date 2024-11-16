<script lang="ts">
	let { maxStep = 3, currentStep = 1 } = $props();
</script>

<div class="flex gap-4">
	{#each [...Array(maxStep).keys()] as step}
		<div
			data-complete={step < currentStep - 1}
			data-current={step === currentStep - 1}
			class="step-{step} h-1 flex-1 rounded-full border-0 bg-white/10 data-[complete=true]:bg-white data-[current=true]:bg-white"
		></div>
	{/each}
</div>
