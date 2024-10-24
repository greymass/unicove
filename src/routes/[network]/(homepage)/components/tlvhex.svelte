<script lang="ts">
	import EOS from '$lib/assets/EOS@2x.svg';

	const { TLV, APY } = $props();
</script>

<div class="relative max-w-fit">
	<!-- Big hex -->
	<div class="grid place-items-center *:col-start-1 *:row-start-1">
		<svg
			class="size-56 object-contain md:size-full"
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
			<img class="mb-3 h-10 place-self-center md:h-20" src={EOS} alt="eos" />
			<span class="text-base text-white/60 md:text-lg">Total locked value</span>
			<!-- TODO: add eos formatter -->
			<span class="text-lg font-semibold md:text-2xl">{TLV} EOS</span>
		</div>
	</div>

	<!-- Small hex -->
	<div class="absolute -bottom-4 -right-2 grid place-items-center *:col-start-1 *:row-start-1">
		<svg
			class="size-20 object-contain md:size-full"
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
			<span class="text-base text-white/60 md:text-lg">APY</span>
			<span class="text-lg font-semibold md:text-2xl">{APY}%</span>
		</div>
	</div>
</div>
