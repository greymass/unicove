<script lang="ts">
	import EOS from '$lib/assets/EOS@2x.svg';

	const { TLV, APY } = $props();
</script>

<div class="grid grid-cols-12 grid-rows-6">
	<!-- Big hex -->
	<div
		class="col-span-11 col-start-1 row-span-full grid place-items-center *:col-start-1 *:row-start-1"
	>
		<svg
			class="h-full w-full object-contain"
			width="296"
			height="342"
			viewBox="0 0 296 342"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m148.245.755 147.437 85.123v170.245l-147.437 85.123L.809 256.123V85.878L148.245.755Z"
				fill="#202429"
			/>
		</svg>
		<div class="grid gap-2 text-center uppercase">
			<img class="mb-3 h-20 place-self-center" src={EOS} alt="eos" />
			<span class="text-lg text-white/60">Total locked value</span>
			<!-- TODO: add eos formatter -->
			<span class="text-2xl font-semibold">{TLV} EOS</span>
		</div>
	</div>

	<!-- Small hex -->
	<div
		class="col-span-4 col-start-9 row-span-2 row-start-5 grid place-items-center *:col-start-1 *:row-start-1"
	>
		<svg
			class="h-full w-full object-contain"
			width="95"
			height="110"
			viewBox="0 0 95 110"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m47.522.804 47.18 27.24v54.478l-47.18 27.239-47.18-27.24V28.044L47.522.804Z"
				fill="#2B3035"
			/>
		</svg>
		<div class="grid text-center uppercase">
			<span class="text-lg text-white/60">APY</span>
			<span class="text-2xl font-semibold">{APY}%</span>
		</div>
	</div>
</div>
